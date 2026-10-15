import type {
    ApiError,
    AuthResponse,
    FavoriteRequest,
    RegisterResponse,
    Track,
} from '../types/api';

const API_URL = 'http://localhost:8000/api';

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data: unknown = await response.json();

    if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || 'Произошла ошибка запроса');
    }

    return data as T;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Пользователь не авторизован');
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

export function register(
    username: string,
    password: string,
): Promise<RegisterResponse> {
    return request<RegisterResponse>('/register', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password,
        }),
    });
}

export function login(
    username: string,
    password: string,
): Promise<AuthResponse> {
    return request<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password,
        }),
    });
}

export function getTracks(): Promise<Track[]> {
    return request<Track[]>('/tracks', {
        headers: getAuthHeaders(),
    });
}

export function getFavorites(): Promise<Track[]> {
    return request<Track[]>('/favorites', {
        headers: getAuthHeaders(),
    });
}

export function addFavorite(trackId: number): Promise<unknown> {
    const body: FavoriteRequest = { trackId };

    return request<unknown>('/favorites', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });
}

export function removeFavorite(trackId: number): Promise<unknown> {
    const body: FavoriteRequest = { trackId };

    return request<unknown>('/favorites', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
    });
}
