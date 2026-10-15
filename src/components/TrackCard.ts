import { el, setAttr, type RedomComponent } from 'redom';
import type { Track } from '../types/api';

export interface TrackCardCallbacks {
    onSelect: (track: Track) => void;
    onFavorite: (track: Track) => void;
}

export class TrackCard implements RedomComponent {
    el: HTMLElement;

    private readonly favoriteButton: HTMLButtonElement;

    constructor(
        track: Track,
        index: number,
        callbacks: TrackCardCallbacks,
        isFavorite = false,
    ) {
        this.favoriteButton = el(
            'button.track-card__favorite',
            isFavorite ? '♥' : '♡',
        ) as HTMLButtonElement;

        this.updateFavoriteState(isFavorite);

        const menuButton = el(
            'button.track-card__menu',
            '•••',
        );

        setAttr(menuButton, {
            type: 'button',
            'aria-label': 'Открыть меню трека',
        });

        this.el = el(
            'article.track-card',

            el(
                'span.track-card__number',
                String(index + 1),
            ),

            el(
                'div.track-card__cover',
                track.cover
                    ? el('img', {
                        src: track.cover,
                        alt: `Обложка трека ${track.title}`,
                    })
                    : el(
                        'div.track-card__cover-placeholder',
                        '♫',
                    ),
            ),

            el(
                'div.track-card__info',
                el(
                    'h3.track-card__title',
                    track.title,
                ),
                el(
                    'p.track-card__artist',
                    track.artist,
                ),
            ),

            el(
                'div.track-card__album',
                track.album || '—',
            ),

            el(
                'div.track-card__date',
                formatDate(track.releaseDate),
            ),

            this.favoriteButton,

            el(
                'span.track-card__duration',
                formatDuration(track.duration),
            ),

            menuButton,
        );

        this.favoriteButton.addEventListener(
            'click',
            (event: MouseEvent) => {
                event.stopPropagation();

                callbacks.onFavorite(track);
            },
        );

        this.el.addEventListener(
            'click',
            (event: MouseEvent) => {
                const target = event.target;

                if (!(target instanceof HTMLElement)) {
                    return;
                }

                if (
                    target.closest(
                        '.track-card__favorite',
                    )
                ) {
                    return;
                }

                if (
                    target.closest(
                        '.track-card__menu',
                    )
                ) {
                    return;
                }

                callbacks.onSelect(track);
            },
        );
    }

    setFavorite(isFavorite: boolean): void {
        this.favoriteButton.textContent =
            isFavorite ? '♥' : '♡';

        this.updateFavoriteState(isFavorite);
    }

    private updateFavoriteState(
        isFavorite: boolean,
    ): void {
        setAttr(this.favoriteButton, {
            type: 'button',
            'aria-label': isFavorite
                ? 'Удалить из избранного'
                : 'Добавить в избранное',
        });
    }
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = Math.floor(
        seconds % 60,
    );

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
}

function formatDate(date: string): string {
    if (!date) {
        return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        'ru-RU',
    );
}
