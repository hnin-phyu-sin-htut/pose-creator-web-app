import { Link, useNavigate } from "react-router-dom";
import { getUsername, isLoggedIn, logout } from "../services/AuthService";

export default function NavbarComponent() {
    const navigate = useNavigate();

    const loggedIn = isLoggedIn();
    const username = getUsername();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

                <Link
                    to="/"
                    className="group flex items-center gap-3"
                >
                    <div className="relative flex h-12 w-12 items-center justify-center">

                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 opacity-80 blur-md transition duration-500 group-hover:scale-110"></div>

                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">

                            <div className="relative">
                                <div className="h-5 w-5 rotate-45 rounded-md bg-gradient-to-br from-cyan-400 to-purple-500"></div>

                                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-pink-400 shadow-lg shadow-pink-400/50"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col leading-tight">
                        <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-lg font-bold tracking-wide text-transparent">
                            Pose Creator
                        </span>

                        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                            AI Studio
                        </span>
                    </div>
                </Link>

                <ul className="flex items-center gap-2 sm:gap-4">

                    <li>
                        <Link
                            to="/"
                            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
                        >
                            Chat
                        </Link>
                    </li>

                    {loggedIn && (
                        <li>
                            <Link
                                to="/history"
                                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
                            >
                                History
                            </Link>
                        </li>
                    )}

                    {!loggedIn && (
                        <>
                            <li>
                                <Link
                                    to="/login"
                                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
                                >
                                    Login
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/register"
                                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/40"
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </>
                    )}

                    {loggedIn && (
                        <>
                            <li className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 text-sm font-bold text-white">
                                    {username?.charAt(0).toUpperCase()}
                                </div>

                                <span className="max-w-[120px] truncate text-sm text-slate-200">
                                    {username}
                                </span>
                            </li>

                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-all duration-300 hover:bg-red-500/20 hover:text-white"
                                >
                                    Logout
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}