import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import type { LoginDto } from "../model/LoginDto";
import { login, setSession } from "../services/AuthService";

export default function LoginComponent() {
    const navigate = useNavigate();
    const location = useLocation();

    const [dto, setDto] = useState<LoginDto>({
        username: "",
        password: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const state = location.state as { infoMessage?: string } | null;
        if (state?.infoMessage) setInfo(state.infoMessage);
    }, [location.state]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await login(dto);
            setSession(res.data);
            navigate("/");
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white">
            <NavbarComponent />

            <div className="flex items-center justify-center min-h-screen px-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl"
                >
                    <div className="flex flex-col items-center mb-6">
                        <CloverLogo />
                        <h1 className="text-2xl font-bold mt-3">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-slate-400">
                            Login to continue
                        </p>
                    </div>

                    {info && (
                        <p className="text-cyan-300 text-sm mb-3">{info}</p>
                    )}
                    {error && (
                        <p className="text-red-400 text-sm mb-3">{error}</p>
                    )}

                    <input
                        className="w-full mb-3 p-3 rounded-xl bg-white/5 outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Username"
                        value={dto.username}
                        onChange={(e) =>
                            setDto({ ...dto, username: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        className="w-full mb-5 p-3 rounded-xl bg-white/5 outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Password"
                        value={dto.password}
                        onChange={(e) =>
                            setDto({ ...dto, password: e.target.value })
                        }
                    />

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold transition hover:scale-[1.02] disabled:opacity-50"
                    >
                        {submitting ? "Loading..." : "Login"}
                    </button>

                    <p className="text-center text-sm mt-4 text-slate-400">
                        No account?{" "}
                        <Link className="text-cyan-300" to="/register">
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

function CloverLogo() {
    return (
        <div className="relative h-16 w-16 flex items-center justify-center">
            <div className="absolute h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 blur-2xl" />

            <div className="absolute h-2.5 w-2.5 bg-white rounded-full shadow-md" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/40" />

            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-purple-500 rounded-full shadow-lg shadow-purple-500/40" />

            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-pink-400 rounded-full shadow-lg shadow-pink-400/40" />

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-4 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/40" />
        </div>
    );
}