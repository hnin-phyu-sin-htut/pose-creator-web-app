import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, deleteProfile } from "../services/ProfileService";
import { logout, isLoggedIn } from "../services/AuthService";
import type { ProfileDto, UpdateProfileDto } from "../model/ProfileDto";
import { useUser } from "../context/UserContext";
import NavbarComponent from "./NavbarComponent.tsx";

export default function ProfileComponent() {
    const navigate = useNavigate();
    const { setProfile: setGlobalProfile } = useUser();

    const [profile, setProfile] = useState<ProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    const [form, setForm] = useState<UpdateProfileDto>({
        username: "",
        bio: "",
        phone: "",
        birthday: "",
    });

    const BASE_URL = "http://localhost:8080";
    const imageToShow = editMode && preview ? preview : profile?.profileImage ? `${BASE_URL}${profile.profileImage}` : "";

    useEffect(() => {
        if (!isLoggedIn()) navigate("/login", { replace: true });

        getProfile()
            .then((data) => {
                setProfile(data);
                setGlobalProfile(data); // sync with navbar
                setForm({
                    username: data.username || "",
                    bio: data.bio || "",
                    phone: data.phone || "",
                    birthday: data.birthday?.slice(0, 10) || "",
                });
                setPreview(data.profileImage ? `${BASE_URL}${data.profileImage}` : "");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("username", form.username);
            fd.append("bio", form.bio || "");
            fd.append("phone", form.phone || "");
            fd.append("birthday", form.birthday || "");
            if (file) fd.append("profileImageFile", file);

            const updated = await updateProfile(fd);
            setProfile(updated);
            setGlobalProfile(updated);
            setPreview(updated.profileImage ? `${BASE_URL}${updated.profileImage}` : "");
            setFile(null);
            setEditMode(false);
        } catch {
            alert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete account?")) return;
        await deleteProfile();
        logout();
        navigate("/login", { replace: true });
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">Loading...</div>;
    if (!profile) return null;

    return (
        <>
            <NavbarComponent />
            <div className="min-h-screen bg-gray-900 flex justify-center p-6">
                <div className="w-full max-w-md space-y-6">
                    <div className="bg-gray-800 rounded-3xl shadow-lg p-6 text-center border border-gray-700">
                        {imageToShow ? (
                            <img src={imageToShow} className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-indigo-500" />
                        ) : (
                            <div className="w-28 h-28 mx-auto rounded-full bg-indigo-500 flex items-center justify-center text-3xl text-white font-bold">{profile.username?.[0]}</div>
                        )}
                        <h1 className="mt-4 text-2xl font-semibold text-white">{profile.username}</h1>
                        <p className="text-gray-300">{profile.email}</p>
                        <button onClick={() => setEditMode(!editMode)} className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition">{editMode ? "Close" : "Edit Profile"}</button>
                    </div>

                    <div className="bg-gray-800 rounded-2xl shadow p-5 space-y-4 border border-gray-700">
                        {[
                            ["Phone Number", profile.phone],
                            ["Birthday", profile.birthday],
                            ["Bio", profile.bio],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between items-center">
                                <span className="text-gray-400 font-medium">{label}</span>
                                <span className="text-white text-right">{value || "-"}</span>
                            </div>
                        ))}
                    </div>

                    {editMode && (
                        <div className="bg-gray-800 rounded-2xl shadow p-5 space-y-4 border border-gray-700">
                            <input type="text" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <input type="text" placeholder="Phone No" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-600 bg-gray-900 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            <input type="file" className="text-sm text-gray-300" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition">{saving ? "Saving..." : "Save Changes"}</button>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => navigate("/")} className="py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-900 transition">Chat</button>
                        <button onClick={handleLogout} className="py-3 rounded-xl bg-gray-800 text-white hover:bg-gray-900 transition">Logout</button>
                        <button onClick={handleDelete} className="py-3 rounded-xl bg-red-700 text-white hover:bg-red-600 transition">Delete Account</button>
                    </div>
                </div>
            </div>
        </>
    );
}