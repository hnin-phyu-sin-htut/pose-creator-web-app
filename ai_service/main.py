import base64
import logging
import random
import time
import urllib.parse
from typing import List, Optional

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ai_service")

STYLE_PROMPTS = {
    "3D Anime": ("strong anime style, vibrant colors, cinematic lighting", 1.3),
    "Ghibli": ("Studio Ghibli style, soft watercolor, dreamy atmosphere", 1.4),
    "Cartoon": ("cartoon illustration, bold outlines, expressive style", 1.2),
    "Watercolor": ("watercolor painting, soft pastel tones, paper texture", 1.4),
    "Minimalist Sketch": ("black and white pencil sketch ONLY, line art", 2.0),
}

QUALITY = "ultra realistic, cinematic photography, HDR, sharp focus, film grain"

FULL_BODY_BOOST = """
full body shot, head to toe visible,
wide angle 24mm lens, zoomed out composition,
subject fully visible, no crop, fashion pose
"""

POSE_MAP = {
    "solo": [
        "fashion editorial pose with strong posture and direct gaze",
        "street walking mid-step with motion blur vibe",
        "looking over shoulder while walking away",
        "leaning on wall with relaxed hands in pockets",
        "sitting on stairs with elbows on knees, thoughtful mood",
        "close-up portrait with soft smile and natural light",
        "dynamic wind-swept hair action shot",
        "candid laughing while looking down",
        "hands adjusting jacket or outfit mid-movement",
        "silhouette pose against sunset background",
        "mirror selfie aesthetic pose with phone partially visible",
        "seated cafe window pose staring outside",
        "hands in hair slightly messy editorial look",
        "walking across crosswalk with city blur behind"
    ],

    "couple": [
        "walking hand in hand through city street",
        "forehead touching romantic still pose",
        "soft back hug with natural smiles",
        "laughing together mid-walk candid shot",
        "sitting close on steps or park bench",
        "slow dance pose with eye contact",
        "holding hands while crossing street",
        "forehead kiss in soft golden hour light",
        "partner whispering and reaction smile",
        "leaning heads together relaxed vibe",
        "running together playful motion shot",
        "wrapped in blanket cozy outdoor moment",
        "silhouette couple holding hands at sunset",
        "twirling partner mid-street playful moment"
    ],

    "friends": [
        "group walking together laughing naturally",
        "candid street conversation mid-motion",
        "jump shot celebration with energy",
        "sitting on steps relaxed hangout vibe",
        "walking toward camera confident group energy",
        "group selfie style candid laughter",
        "leaning on each other joking around",
        "crossing street together dynamic movement",
        "clapping or cheering moment shot",
        "circle huddle laughing from above angle",
        "late-night street hangout neon vibe",
        "posing with arms over shoulders group bond",
        "running together playful chaos shot",
        "sitting curbside eating or chatting casually"
    ],

    "family": [
        "family standing portrait close together smiling",
        "walking together holding hands casually",
        "candid interaction between parents and kids",
        "seated cozy indoor family moment",
        "multi-generation portrait with grandparents",
        "outdoor picnic relaxed lifestyle shot",
        "kids playing while parents watch warmly",
        "family laughing together candid moment",
        "parents holding child with soft natural light",
        "walking away shot from behind together",
        "holiday gathering warm indoor atmosphere",
        "kids hugging parents spontaneous moment",
        "family sitting on stairs layered composition",
        "group looking at camera then laughing candid shift"
    ]
}

app = FastAPI(title="AI Pose Studio PRO", version="9.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    count: int = Field(default=1, ge=1, le=4)

class GenerateResponse(BaseModel):
    images: List[str]
    model: str

def get_style(style: Optional[str]):
    if not style:
        return QUALITY, 1.0
    return STYLE_PROMPTS.get(style, (style, 1.0))


def pick_pose(prompt: str):
    text = prompt.lower()
    for k, v in POSE_MAP.items():
        if k in text:
            return random.choice(v)
    return ""

def build_prompt(prompt: str, style: Optional[str]) -> str:
    style_text, weight = get_style(style)

    if style == "Minimalist Sketch":
        return f"""
{prompt},
{style_text},
STRICT BLACK AND WHITE SKETCH ONLY,
no realism, no photo
"""

    return f"""
{prompt},
({style_text}:{weight}),
{FULL_BODY_BOOST},
IMPORTANT: preserve original background exactly as input image,
do not change environment, do not redesign scene,
only adjust subject pose and lighting,
cinematic composition
"""

def call_ai(prompt: str, seed: int, bg: Optional[str] = None):

    encoded = urllib.parse.quote(prompt)

    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width=1024&height=1024"
        f"&model=flux-realism"
        f"&seed={seed}"
        f"&nologo=true"
    )

    if bg:
        url += f"&image={urllib.parse.quote(bg)}"

    r = requests.get(url, timeout=120)

    if r.status_code == 200 and "image" in r.headers.get("content-type", ""):
        return r.content

    raise HTTPException(502, "generation failed.")

def encode_background(bg: str) -> str:
    if bg.startswith("http"):
        return bg
    return f"data:image/png;base64,{bg}"

@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):

    images = []
    used_pose = None

    bg = None

    for i in range(req.count):

        seed = random.randint(1, 999999)

        pose = pick_pose(req.prompt)
        if pose == used_pose:
            pose = pick_pose(req.prompt)
        used_pose = pose

        base_prompt = req.prompt.strip()
        if pose:
            base_prompt += f", {pose}"

        full_prompt = build_prompt(base_prompt, req.style)

        log.info("PROMPT %d: %s", i + 1, full_prompt[:180])

        if i > 0:
            time.sleep(0.8)

        img = call_ai(full_prompt, seed, bg)

        b64 = base64.b64encode(img).decode()
        images.append(f"data:image/png;base64,{b64}")

    return GenerateResponse(images=images, model="flux-realism")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8008)