import api from "./api";
import type { ProfileDto } from "../model/ProfileDto";

export const getProfile = async (): Promise<ProfileDto> => {
    const res = await api.get("/profile");
    return res.data;
};

export const updateProfile = async (data: FormData): Promise<ProfileDto> => {
    const res = await api.put("/profile", data);
    return res.data;
};

export const deleteProfile = async (): Promise<void> => {
    await api.delete("/profile");
};