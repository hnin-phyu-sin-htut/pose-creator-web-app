import { useEffect, useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import { api } from "../services/api";
import { isLoggedIn } from "../services/AuthService";
import {ChevronDown, Sparkles} from "lucide-react";

type HistoryItem = {
    id: number;
    prompt: string;
    style: string | null;
    count: number;
    inputImagePath: string | null;
    images: string[];
    imageCount: number;
    createdAt: string;
};

function downloadDataUrl(dataUrl: string, filename: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export default function HistoryComponent() {
    const navigate = useNavigate();

    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openId, setOpenId] = useState<number | null>(null);
    const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
    const [detailError, setDetailError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/login", {
                state: { infoMessage: "Login to view your history." },
            });
            return;
        }

        api.get<HistoryItem[]>("/history")
            .then((res) => setItems(res.data))
            .catch(() => setError("Failed to load history."))
            .finally(() => setLoading(false));
    }, [navigate]);

    async function handleToggle(item: HistoryItem) {
        if (openId === item.id) {
            setOpenId(null);
            return;
        }

        setOpenId(item.id);
        setDetailError(null);

        if (item.images.length === 0 && item.imageCount > 0) {
            setDetailLoadingId(item.id);

            try {
                const res = await api.get<HistoryItem>(`/history/${item.id}`);

                setItems((prev) =>
                    prev.map((it) =>
                        it.id === item.id
                            ? { ...it, images: res.data.images }
                            : it,
                    ),
                );
            } catch {
                setDetailError("Failed to load images.");
            } finally {
                setDetailLoadingId(null);
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-hidden">
            <NavbarComponent />

            <div className="fixed inset-0 -z-10">
                <div className="absolute top-[-120px] left-[-80px] w-[350px] h-[350px] bg-fuchsia-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-120px] right-[-80px] w-[350px] h-[350px] bg-cyan-500/20 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                    <div>
                        <p className="uppercase tracking-[0.3em] text-cyan-300 text-xs mb-2">
                            AI Gallery
                        </p>

                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                            Your Creation History
                        </h1>

                        <p className="text-gray-400 mt-3 max-w-xl">
                            Explore all previously generated artwork with a futuristic
                            gallery experience.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-xl">
                        <p className="text-sm text-gray-400">Total Creations</p>
                        <h2 className="text-3xl font-bold">
                            {items.reduce((sum, item) => sum + item.imageCount, 0)}
                        </h2>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-14 h-14 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10" />
                        <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                                <Logo />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-white">
                                Your gallery is empty.
                            </h2>

                            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-400">
                                Create stunning AI-generated artwork and watch your personal gallery come to life.
                            </p>

                            <button
                                className="h-12 px-3 mt-5 sm:px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition font-medium flex items-center gap-2 disabled:opacity-50 shrink-0"
                            >

                                <Link to={"/"} className="hidden sm:block">
                                    Generate your first image
                                </Link>
                            </button>

                            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                AI generations appear here instantly
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {items.map((item, index) => {
                        const open = openId === item.id;

                        return (
                            <div
                                key={item.id}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-[32px]" />

                                <div className="relative bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-2xl">
                                    <button
                                        onClick={() => handleToggle(item)}
                                        className="w-full p-6 text-left"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                            <div className="flex gap-5 items-start">
                                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-fuchsia-500/20">
                                                    {index + 1}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="text-lg md:text-xl font-semibold line-clamp-2">
                                                        {item.prompt}
                                                    </h2>

                                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                                        <span className="px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/20 text-fuchsia-200 text-xs">
                                                            {item.style ?? "No Style"}
                                                        </span>

                                                        <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/20 text-cyan-200 text-xs">
                                                            {item.imageCount} image
                                                            {item.imageCount > 1
                                                                ? "s"
                                                                : ""}
                                                        </span>

                                                        <span className="text-xs text-gray-400">
                                                            {new Date(
                                                                item.createdAt,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="hidden md:flex w-12 h-12 rounded-2xl bg-white/5 border border-white/10 items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-fuchsia-300" />
                                                </div>

                                                <div
                                                    className={`transition duration-300 text-2xl ${
                                                        open
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                >
                                                    <ChevronDown className="w-6 h-6 text-cyan-200" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    <div
                                        className={`transition-all duration-500 overflow-hidden ${
                                            open
                                                ? "max-h-[4000px] opacity-100"
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div className="px-6 pb-6">
                                            <div className="border-t border-white/10 pt-6">
                                                {detailLoadingId === item.id && (
                                                    <div className="flex items-center gap-3 text-gray-400">
                                                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                                        Loading images...
                                                    </div>
                                                )}

                                                {detailError &&
                                                    openId === item.id && (
                                                        <p className="text-red-400">
                                                            {detailError}
                                                        </p>
                                                    )}

                                                {detailLoadingId !== item.id &&
                                                    item.images.length === 0 &&
                                                    item.imageCount === 0 && (
                                                        <div className="bg-black/20 border border-white/10 rounded-2xl p-8 text-center text-gray-500">
                                                            No images stored.
                                                        </div>
                                                    )}

                                                {item.images.length > 0 && (
                                                    <div
                                                        className={`grid gap-5 ${
                                                            item.images.length ===
                                                            1
                                                                ? "grid-cols-1"
                                                                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                                        }`}
                                                    >
                                                        {item.images.map(
                                                            (src, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 group/card"
                                                                >
                                                                    <img
                                                                        src={src}
                                                                        alt={`generated-${idx}`}
                                                                        className="w-full h-full object-cover transition duration-700 group-hover/card:scale-105"
                                                                    />

                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition duration-300" />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            downloadDataUrl(
                                                                                src,
                                                                                `image-${
                                                                                    idx +
                                                                                    1
                                                                                }.png`,
                                                                            )
                                                                        }
                                                                        className="absolute bottom-4 right-4 opacity-0 group-hover/card:opacity-100 transition duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-sm font-medium"
                                                                    >
                                                                        Download
                                                                    </button>

                                                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold">
                                                                        {idx + 1}
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
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