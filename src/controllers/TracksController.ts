import { TracksModel } from '../models/tracks';
import { TrackList } from '../components/TrackList';
import { Player } from '../components/Player';
import type { Track } from '../types/api';

export class TracksController {
    private readonly model: TracksModel;
    private readonly player: Player;

    constructor(player: Player) {
        this.model = new TracksModel();
        this.player = player;
    }

    async loadTracks(
        trackList: TrackList,
    ): Promise<void> {
        const tracks =
            await this.model.loadTracks();

        const favorites =
            await this.model.loadFavorites();

        trackList.setFavorites(favorites);
        trackList.setTracks(tracks);

        this.player.setTracks(tracks);
    }

    async loadTracksData(): Promise<Track[]> {
        return this.model.loadTracks();
    }

    async loadFavoritesData(): Promise<Track[]> {
        return this.model.loadFavorites();
    }

    async toggleFavorite(
        track: Track,
    ): Promise<void> {
        if (this.model.isFavorite(track.id)) {
            await this.model.removeFromFavorites(
                track.id,
            );

            console.log(
                'Удалено из избранного:',
                track.title,
            );

            return;
        }

        await this.model.addToFavorites(
            track.id,
        );

        console.log(
            'Добавлено в избранное:',
            track.title,
        );
    }
}
