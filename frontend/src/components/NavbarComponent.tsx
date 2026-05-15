import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, logout } from "../services/AuthService";
import { useUser } from "../context/UserContext";

export default function NavbarComponent() {
    const navigate = useNavigate();
    const { profile } = useUser(); // get global profile
    const loggedIn = isLoggedIn();

    const BASE_URL = "http://localhost:8080";
    const username = profile?.username || "";
    const profileImage = profile?.profileImage ? `${BASE_URL}${profile.profileImage}` : null;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950 shadow-lg">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                <Link to="/" className="group flex items-center gap-3">
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
                        <Link className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition" to="/">
                            Chat
                        </Link>
                    </li>

                    {loggedIn && (
                        <li>
                            <Link className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition" to="/history">
                                History
                            </Link>
                        </li>
                    )}

                    {!loggedIn && (
                        <>
                            <li>
                                <Link className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition" to="/login">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-105" to="/register">
                                    Sign Up
                                </Link>
                            </li>
                        </>
                    )}

                    {loggedIn && (
                        <>
                            <li className="hidden sm:flex">
                                <Link to="/profile" className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 rounded-full overflow-hidden items-center justify-center bg-gray-800 text-white">
                                        {profileImage ? (
                                            <img
                                                className="h-full w-full object-cover"
                                                src={profileImage}
                                                alt="Profile"
                                            />
                                        ) : (
                                            username.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    {!profileImage}
                                </Link>
                            </li>

                            <li>
                                <button
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-white transition"
                                    onClick={handleLogout}
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