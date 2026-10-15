
import {
    addFavorite,
    getFavorites,
    getTracks,
    removeFavorite,
} from '../api/client';

import type { Track } from '../types/api';

const localAudioTracks: Record<number, { title: string; artist: string; audioUrl: string }> = {
    1: {
        title: 'Suspense Tension',
        artist: 'LNPlusMusic',
        audioUrl: '/audio/lnplusmusic-suspense-tension-suspenseful-tense-323181.mp3',
    },
    2: {
        title: 'Moment of Peace',
        artist: 'Mickeyscat',
        audioUrl: '/audio/mickeyscat-moment-of-peace-mickeyscat-554494.mp3',
    },
    3: {
        title: 'Christmas',
        artist: 'TuneTank',
        audioUrl: '/audio/tunetank-christmas-347469.mp3',
    },
    4: {
        title: 'Wonders of the Earth',
        artist: 'Grand Project',
        audioUrl: '/audio/grand_project-wonders-of-the-earth-550792.mp3',
    },
    5: {
        title: 'Lay Back',
        artist: 'GrumpyNora',
        audioUrl: '/audio/grumpynora-lay-back-619255.mp3',
    },
};

export class TracksModel {
    private tracks: Track[] = [];
    private favorites: Track[] = [];

    async loadTracks(): Promise<Track[]> {
        const tracks = await getTracks();

        this.tracks = tracks.map((track) => {
            const localTrack = localAudioTracks[track.id];

            if (!localTrack) {
                return track;
            }

            return {
                ...track,
                ...localTrack,
                album: track.album || '',
                releaseDate: track.releaseDate || '',
                cover: track.cover || '',
            };
        });

        return this.tracks;
    }

    async loadFavorites(): Promise<Track[]> {
        this.favorites = await getFavorites();
        return this.favorites;
    }

    getTracksList(): Track[] {
        return this.tracks;
    }

    getFavoritesList(): Track[] {
        return this.favorites;
    }

    async addToFavorites(trackId: number): Promise<void> {
        await addFavorite(trackId);

        const track = this.tracks.find((item) => item.id === trackId);

        if (track && !this.favorites.some((item) => item.id === trackId)) {
            this.favorites.push(track);
        }
    }

    async removeFromFavorites(trackId: number): Promise<void> {
        await removeFavorite(trackId);

        this.favorites = this.favorites.filter((item) => item.id !== trackId);
    }

    isFavorite(trackId: number): boolean {
        return this.favorites.some((item) => item.id === trackId);
    }
}
