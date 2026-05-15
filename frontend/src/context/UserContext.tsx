import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProfileDto } from "../model/ProfileDto";

type UserContextType = {
    profile: ProfileDto | null;
    setProfile: (profile: ProfileDto | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useState<ProfileDto | null>(null);

    return (
        <UserContext.Provider value={{ profile, setProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};