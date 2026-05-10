import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import type { RegisterDto } from "../model/RegisterDto";
import { register, setSession } from "../services/AuthService";

export default function RegisterComponent() {
    const navigate = useNavigate();

    const [dto, setDto] = useState<RegisterDto>({
        username: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await register(dto);
            setSession(res.data);
            setSuccess("Account created successfully!");

            setTimeout(() => navigate("/"), 1000);
        } catch (err: unknown) {
            const e = err as {
                response?: {
                    data?: { message?: string };
                };
            };

            setError(e?.response?.data?.message ?? "Registration failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white">

            <NavbarComponent />

            <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="flex items-center justify-center min-h-screen px-4 pt-20">

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 shadow-2xl"
                >

                    <div className="flex flex-col items-center mb-6">
                        <CloverLogo />

                        <h1 className="mt-4 text-2xl font-bold">
                            Create Account
                        </h1>

                        <p className="text-sm text-slate-400">
                            Join and start your journey
                        </p>
                    </div>

                    {success && (
                        <div className="mb-3 rounded-xl border border-green-400/20 bg-green-500/10 px-3 py-2 text-sm text-green-300">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">

                        <input
                            className="w-full p-3 rounded-xl bg-white/5 outline-none border border-white/10 focus:border-cyan-400"
                            placeholder="Username"
                            value={dto.username}
                            onChange={(e) =>
                                setDto({ ...dto, username: e.target.value })
                            }
                        />

                        <input
                            className="w-full p-3 rounded-xl bg-white/5 outline-none border border-white/10 focus:border-cyan-400"
                            placeholder="Email"
                            value={dto.email}
                            onChange={(e) =>
                                setDto({ ...dto, email: e.target.value })
                            }
                        />

                        <input
                            type="password"
                            className="w-full p-3 rounded-xl bg-white/5 outline-none border border-white/10 focus:border-purple-400"
                            placeholder="Password"
                            value={dto.password}
                            onChange={(e) =>
                                setDto({ ...dto, password: e.target.value })
                            }
                        />
                    </div>

                    <button
                        disabled={submitting}
                        className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold transition hover:scale-[1.02] disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Create Account"}
                    </button>

                    <p className="text-center text-sm mt-4 text-slate-400">
                        Already have account?{" "}
                        <Link
                            className="text-cyan-300 hover:underline"
                            to="/login"
                        >
                            Login
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