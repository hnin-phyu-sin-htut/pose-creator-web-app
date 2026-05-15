export interface ProfileDto {
    id: number;
    username: string;
    email: string;
    bio?: string;
    phone?: string;
    birthday?: string;
    profileImage?: string;
}

export interface UpdateProfileDto {
    username: string;
    bio?: string;
    phone?: string;
    birthday?: string;
    profileImageFile?: File;
}