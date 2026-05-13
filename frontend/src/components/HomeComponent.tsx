import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    Paperclip,
    X,
    SendHorizonal,
    Sparkles,
    ImageIcon,
    Wand2,
    Layers3,
    Menu,
} from "lucide-react";

import NavbarComponent from "./NavbarComponent";
import {api} from "../services/api";
import {isLoggedIn} from "../services/AuthService";

type Message = {
    role: "user" | "bot" | "error";
    text?: string;
    images?: string[];
    style?: string;
    count?: number;
    timestamp: number;
};

const STYLES = [
    "3D Anime",
    "Ghibli",
    "Cartoon",
    "Watercolor",
    "Minimalist Sketch",
];

export default function HomeComponent() {
    const navigate = useNavigate();

    const [prompt, setPrompt] = useState("");
    const [style, setStyle] = useState(STYLES[0]);
    const [count, setCount] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!isLoggedIn()) {
            navigate("/login", {
                state: {
                    infoMessage: "Login required.",
                },
            });
            return;
        }

        if (!prompt.trim() && !file) return;

        const userMsg: Message = {
            role: "user",
            text: prompt || "(image only)",
            images: file ? [URL.createObjectURL(file)] : undefined,
            style,
            count,
            timestamp: Date.now(),
        };

        setMessages((p) => [...p, userMsg]);
        setLoading(true);

        try {
            const form = new FormData();

            form.append("prompt", prompt || "creative pose");
            form.append("style", style);
            form.append("count", String(count));

            if (file) {
                form.append("image", file);
            }

            const res = await api.post("/generate", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessages((p) => [
                ...p,
                {
                    role: "bot",
                    images: res.data?.images || [],
                    style,
                    count,
                    timestamp: Date.now(),
                },
            ]);
        } catch {
            setMessages((p) => [
                ...p,
                {
                    role: "error",
                    text: "Generation failed.",
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setLoading(false);
            setPrompt("");
            setFile(null);

            if (fileRef.current) {
                fileRef.current.value = "";
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#040816] text-white overflow-x-hidden">
            <NavbarComponent/>

            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute top-[-150px] left-[-120px] w-[400px] h-[400px] bg-fuchsia-600/20 blur-[120px] rounded-full"/>

                <div
                    className="absolute bottom-[-150px] right-[-120px] w-[400px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full"/>

                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]"/>
            </div>

            <main className="min-h-[calc(100vh-72px)] flex flex-col xl:flex-row gap-4 p-2 sm:p-4">
                <div
                    className="xl:hidden flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
                    <div className="flex items-center gap-3">
                        <Logo/>

                        <div>
                            <h2 className="font-bold">AI Studio</h2>
                            <p className="text-xs text-slate-400">
                                Creative Workspace
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
                    >
                        <Menu size={20}/>
                    </button>
                </div>

                <aside
                    className={`
                    ${sidebarOpen ? "flex" : "hidden"}
                    xl:flex
                    w-full
                    xl:w-[320px]
                    xl:min-w-[320px]
                    shrink-0
                    flex-col
                    rounded-[28px]
                    border
                    border-white/10
                    bg-white/5
                    backdrop-blur-2xl
                    overflow-hidden
                    max-h-full
                        `}
                >
                    <div className="p-6 border-b border-white/10 hidden xl:block">
                        <div className="flex items-center gap-4">
                            <Logo/>

                            <div>
                                <h1 className="text-xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                                    AI Studio
                                </h1>

                                <p className="text-sm text-slate-400">
                                    Create futuristic artwork
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Wand2 className="w-5 h-5 text-fuchsia-300"/>

                            <h2 className="font-semibold">
                                Artistic Styles
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {STYLES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`w-full rounded-2xl p-4 text-left transition-all duration-300 border ${
                                        style === s
                                            ? "bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/10"
                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                            {s}
                                        </span>

                                        {style === s && (
                                            <Sparkles className="w-4 h-4 text-cyan-300"/>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Layers3 className="w-5 h-5 text-cyan-300"/>

                                <h2 className="font-semibold">
                                    Image Count
                                </h2>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setCount(n)}
                                        className={`h-[88px] rounded-2xl transition-all duration-300 flex flex-col items-center justify-center ${
                                            count === n
                                                ? "bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20"
                                                : "bg-white/5 hover:bg-white/10 border border-white/10"
                                        }`}
                                    >
                                        <span className="text-2xl font-black leading-none">
                                            {n}
                                        </span>

                                        <span className="text-xs mt-2 text-slate-200 leading-none">
                                            {n === 1 ? "Image" : "Images"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <ImageIcon className="w-5 h-5 text-cyan-300"/>

                                <p className="font-semibold">
                                    Workspace
                                </p>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed">
                                Type a simple idea, pick a style, choose how
                                many images, and optionally upload a background
                                reference image to match the setting.
                            </p>
                        </div>
                    </div>
                </aside>

                <section
                    className="flex-1 min-w-0 flex flex-col rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden">
                    <div
                        className="min-h-[80px] border-b border-white/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 min-w-0">
                            <Logo/>

                            <div className="min-w-0">
                                <h2 className="font-bold text-lg truncate">
                                    Creative Workspace
                                </h2>

                                <p className="text-sm text-slate-400 truncate">
                                    AI Image Generation Platform
                                </p>
                            </div>
                        </div>

                        <div
                            className={`px-4 py-2 rounded-full border text-sm w-fit ${
                                loading
                                    ? "bg-fuchsia-500/20 border-fuchsia-400/20 text-fuchsia-200"
                                    : "bg-cyan-500/10 border-cyan-400/20 text-cyan-200"
                            }`}
                        >
                            {loading ? "Generating..." : "Ready"}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex items-center justify-center py-10">
                                <div className="max-w-xl text-center px-4">
                                    <div
                                        className="mx-auto mb-6 flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20">
                                        <Sparkles className="w-10 h-10 text-cyan-200"/>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-fuchsia-400 via-white to-cyan-300 bg-clip-text text-transparent leading-tight">
                                        Create AI Masterpieces
                                    </h1>

                                    <p className="mt-4 text-slate-400 leading-relaxed text-sm md:text-base">
                                        Just type a simple idea like{" "}
                                        <span className="text-cyan-300 italic">"pose idea for a couple"</span>{" "}
                                        - pick your style and count, then hit Generate.
                                        Upload a background image to keep the same setting in your results.
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${
                                    m.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`
                                    w-full
                                    max-w-full
                                    sm:max-w-[90%]
                                    lg:max-w-[850px]
                                    rounded-[24px]
                                    p-4
                                    md:p-5
                                    border
                                    break-words
                                    ${
                                        m.role === "user"
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent"
                                            : m.role === "error"
                                                ? "bg-red-500/10 border-red-400/20"
                                                : "bg-white/5 border-white/10"
                                    }
                                    `}
                                >
                                    {m.text && (
                                        <p className="text-sm leading-relaxed break-words">
                                            {m.text}
                                        </p>
                                    )}

                                    {(m.style || m.count) && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {m.style && (
                                                <span className="px-3 py-1 rounded-full bg-black/20 text-xs">
                                                    {m.style}
                                                </span>
                                            )}

                                            {m.count && (
                                                <span className="px-3 py-1 rounded-full bg-black/20 text-xs">
                                                    {m.count === 1 ? m.count + "Image" : m.count + " Images"}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {m.images && m.images.length > 0 && (
                                        <div
                                            className={`grid gap-4 mt-5 ${
                                                m.images.length === 1
                                                    ? "grid-cols-1"
                                                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                            }`}
                                        >
                                            {m.images.map((img, idx) => {
                                                const isUserImage = m.role === "user";

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black/20"
                                                    >
                                                        <img
                                                            src={img}
                                                            alt="generated"
                                                            className="
                                                            w-full
                                                            max-h-[420px]
                                                            object-cover
                                                            transition
                                                            duration-700
                                                            group-hover:scale-105
                                                        "
                                                        />

                                                        <div
                                                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"/>

                                                        {isUserImage && (
                                                            <button
                                                                onClick={() => setFile(null)}
                                                                className="
                                                                absolute
                                                                top-3
                                                                right-3
                                                                opacity-0
                                                                group-hover:opacity-100
                                                                transition
                                                                bg-black/60
                                                                hover:bg-red-500
                                                                backdrop-blur-md
                                                                rounded-full
                                                                p-2
                                                            "
                                                            >
                                                                <X size={16}/>
                                                            </button>
                                                        )}

                                                        {!isUserImage && (
                                                            <a
                                                                href={img}
                                                                download={`ai-image-${idx + 1}.png`}
                                                                className="
                                                                absolute
                                                                top-3
                                                                right-3
                                                                opacity-0
                                                                group-hover:opacity-100
                                                                transition
                                                                bg-black/60
                                                                hover:bg-cyan-500
                                                                backdrop-blur-md
                                                                rounded-full
                                                                p-2
                                                            "
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path
                                                                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                                    <polyline points="7 10 12 15 17 10"/>
                                                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div
                                    className="bg-white/5 border border-white/10 rounded-[28px] px-6 py-5 flex items-center gap-3">
                                    <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce"/>

                                    <div className="w-3 h-3 bg-fuchsia-300 rounded-full animate-bounce delay-100"/>

                                    <div className="w-3 h-3 bg-cyan-300 rounded-full animate-bounce delay-200"/>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef}/>
                    </div>

                    <div className="border-t border-white/10 p-3 sm:p-5 bg-black/10 backdrop-blur-xl">
                        <input
                            ref={fileRef}
                            type="file"
                            hidden
                            onChange={(e) =>
                                setFile(e.target.files?.[0] || null)
                            }
                        />

                        {file && (
                            <div className="mb-4 relative w-fit">
                                <img
                                    src={URL.createObjectURL(file)}
                                    className="h-24 w-24 rounded-2xl object-cover border border-white/10"
                                />

                                <button
                                    onClick={() => setFile(null)}
                                    className="absolute -top-2 -right-2 bg-black/70 hover:bg-black rounded-full p-1.5"
                                >
                                    <X size={14}/>
                                </button>
                            </div>
                        )}

                        <div
                            className="rounded-[24px] border border-white/10 bg-white/5 p-2 sm:p-3 flex items-end gap-2 w-full">
                            <button
                                onClick={() => fileRef.current?.click()}
                                title="Upload background image"
                                className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition shrink-0"
                            >
                                <Paperclip size={18}/>
                            </button>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. pose idea for a couple, romantic sunset scene..."
                                rows={1}
                                className="flex-1 min-w-0 bg-transparent resize-none outline-none text-sm max-h-40 py-3 overflow-y-auto"
                            />

                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className="h-12 px-3 sm:px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition font-medium flex items-center gap-2 disabled:opacity-50 shrink-0"
                            >
                                <SendHorizonal size={18}/>

                                <span className="hidden sm:block">
                                    Generate
                                </span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function Logo() {
    return (
        <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
            <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 blur-lg opacity-40"/>

            <div className="relative flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white"/>
            </div>
        </div>
    );
}
