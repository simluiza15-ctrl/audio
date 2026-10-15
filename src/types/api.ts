export interface User {
    username: string;
}

export interface Track {
    id: number;
    title: string;
    artist: string;
    album: string;
    releaseDate: string;
    duration: number;
    cover: string;
    audioUrl: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user?: User;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface FavoriteRequest {
    trackId: number;
}

export interface ApiError {
    message: string;
}
