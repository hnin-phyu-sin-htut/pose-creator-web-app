import base64
import logging
import os
import time
from typing import List, Optional

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("ai_service")

HF_TOKEN = os.environ.get("HF_TOKEN")
HF_MODEL = os.environ.get("HF_MODEL", "black-forest-labs/FLUX.1-schnell")

HF_ENDPOINT = os.environ.get(
    "HF_ENDPOINT",
    f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}",
)

STYLE_PROMPTS = {
    "3D Anime": "3D anime style, cinematic lighting, highly detailed character",
    "Ghibli": "Studio Ghibli style, hand-drawn, soft watercolor, painterly",
    "Cartoon": "vibrant cartoon style, bold outlines, flat shading",
    "Watercolor": "watercolor painting, soft pastel colors, paper texture",
    "Minimalist Sketch": "minimalist line art, black ink on white background, clean lines",
}

NEGATIVE_PROMPT = (
    "lowres, bad anatomy, bad hands, missing fingers, extra fingers, blurry, "
    "watermark, text, signature, deformed, ugly"
)


class GenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    count: int = Field(default=1, ge=1, le=4)
    input_image_b64: Optional[str] = None


class GenerateResponse(BaseModel):
    images: List[str]
    model: str


app = FastAPI(title="Pose Creator AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_prompt(prompt: str, style: Optional[str]) -> str:
    if not style:
        return prompt
    suffix = STYLE_PROMPTS.get(style, style)
    return f"{prompt}, {suffix}" if suffix else prompt


def _call_hf(prompt: str, max_retries: int = 3) -> bytes:
    if not HF_TOKEN:
        raise HTTPException(500, "HF_TOKEN is not configured on the server.")

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Accept": "image/png",
        "Content-Type": "application/json",
    }
    payload = {
        "inputs": prompt,
        "parameters": {"negative_prompt": NEGATIVE_PROMPT},
        "options": {"wait_for_model": True},
    }

    for attempt in range(1, max_retries + 1):
        try:
            r = requests.post(HF_ENDPOINT, headers=headers, json=payload, timeout=120)
        except requests.RequestException as e:
            log.warning("HF request failed (attempt %d): %s", attempt, e)
            if attempt == max_retries:
                raise HTTPException(502, f"AI provider unreachable: {e}")
            time.sleep(2 * attempt)
            continue

        ctype = r.headers.get("content-type", "")
        if r.status_code == 200 and ctype.startswith("image"):
            return r.content

        # Cold-start or rate-limit - retry
        if r.status_code in (503, 429):
            wait = 5
            try:
                wait = int(float(r.json().get("estimated_time", 5)))
            except Exception:
                pass
            log.info("HF cold/rate-limit %s — waiting %ds (attempt %d/%d)",
                     r.status_code, wait, attempt, max_retries)
            time.sleep(min(wait + 1, 30))
            continue

        body = (r.text or "")[:300]
        log.error("HF error %s: %s", r.status_code, body)
        if r.status_code == 401:
            raise HTTPException(500, "HF_TOKEN is invalid or unauthorized for this model.")
        if r.status_code == 404:
            raise HTTPException(500, f"HF model not found: {HF_MODEL}")
        if attempt == max_retries:
            raise HTTPException(502, f"Hugging Face error {r.status_code}: {body}")
        time.sleep(2 * attempt)

    raise HTTPException(502, "Image generation failed after retries.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": HF_MODEL,
        "token_configured": bool(HF_TOKEN),
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    full_prompt = _build_prompt(req.prompt.strip(), req.style)
    log.info("Generating %d image(s) | style=%s | prompt=%r", req.count, req.style, full_prompt[:120])

    images: List[str] = []
    last_err: Optional[HTTPException] = None
    for i in range(req.count):
        try:
            img_bytes = _call_hf(full_prompt)
            b64 = base64.b64encode(img_bytes).decode("ascii")
            images.append(f"data:image/png;base64,{b64}")
        except HTTPException as e:
            last_err = e
            log.warning("Image %d/%d failed: %s", i + 1, req.count, e.detail)
            break

    if not images and last_err is not None:
        raise last_err

    return GenerateResponse(images=images, model=HF_MODEL)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("AI_SERVICE_PORT", "8008"))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False)
