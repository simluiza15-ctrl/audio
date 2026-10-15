import { el, type RedomComponent } from 'redom';
import type { Track } from '../types/api';

export class Player implements RedomComponent {
    el: HTMLElement;

    private readonly audio: HTMLAudioElement;

    private readonly titleElement: HTMLElement;
    private readonly artistElement: HTMLElement;
    private readonly coverElement: HTMLElement;

    private readonly playButton: HTMLButtonElement;
    private readonly previousButton: HTMLButtonElement;
    private readonly nextButton: HTMLButtonElement;
    private readonly progressRange: HTMLInputElement;
    private readonly currentTimeElement: HTMLElement;
    private readonly durationElement: HTMLElement;
    private readonly volumeRange: HTMLInputElement;

    private currentTrack: Track | null = null;
    private tracks: Track[] = [];

    constructor() {
        this.audio = new Audio();

        this.titleElement = el(
            'div.player__title',
            'Трек не выбран',
        );

        this.artistElement = el(
            'div.player__artist',
            'Выберите трек для воспроизведения',
        );

        this.coverElement = el(
            'div.player__cover',
            el('span', '♫'),
        );

        this.currentTimeElement = el(
            'span.player__time',
            '0:00',
        );

        this.durationElement = el(
            'span.player__time',
            '0:00',
        );

        this.progressRange = el(
            'input.player__range',
            {
                type: 'range',
                min: '0',
                max: '100',
                value: '0',
                'aria-label': 'Прогресс воспроизведения',
            },
        ) as HTMLInputElement;

        this.volumeRange = el(
            'input.player__volume-range',
            {
                type: 'range',
                min: '0',
                max: '100',
                value: '80',
                'aria-label': 'Громкость',
            },
        ) as HTMLInputElement;

        this.playButton = el(
            'button.player__play',
            {
                type: 'button',
                'aria-label': 'Воспроизвести',
            },
            '▶',
        ) as HTMLButtonElement;

        this.previousButton = el(
            'button.player__button',
            {
                type: 'button',
                'aria-label': 'Предыдущий трек',
            },
            '◀',
        ) as HTMLButtonElement;

        this.nextButton = el(
            'button.player__button',
            {
                type: 'button',
                'aria-label': 'Следующий трек',
            },
            '▶',
        ) as HTMLButtonElement;

        this.playButton.addEventListener(
            'click',
            () => {
                void this.togglePlay();
            },
        );

        this.previousButton.addEventListener(
            'click',
            () => {
                this.previousTrack();
            },
        );

        this.nextButton.addEventListener(
            'click',
            () => {
                this.nextTrack();
            },
        );

        this.progressRange.addEventListener(
            'input',
            () => {
                this.seek();
            },
        );

        this.volumeRange.addEventListener(
            'input',
            () => {
                this.audio.volume =
                    Number(this.volumeRange.value) / 100;
            },
        );

        this.audio.addEventListener(
            'timeupdate',
            () => {
                this.updateProgress();
            },
        );

        this.audio.addEventListener(
            'loadedmetadata',
            () => {
                this.updateDuration();
            },
        );

        this.audio.addEventListener(
            'play',
            () => {
                this.playButton.textContent = '⏸';

                this.playButton.setAttribute(
                    'aria-label',
                    'Поставить на паузу',
                );
            },
        );

        this.audio.addEventListener(
            'pause',
            () => {
                this.playButton.textContent = '▶';

                this.playButton.setAttribute(
                    'aria-label',
                    'Воспроизвести',
                );
            },
        );

        this.audio.addEventListener(
            'ended',
            () => {
                this.nextTrack();

                void this.audio.play();
            },
        );

        document.addEventListener(
            'keydown',
            (event: KeyboardEvent) => {
                if (!this.currentTrack) {
                    return;
                }

                if (event.key === 'ArrowLeft') {
                    this.audio.currentTime = Math.max(
                        0,
                        this.audio.currentTime - 10,
                    );
                }

                if (event.key === 'ArrowRight') {
                    this.audio.currentTime = Math.min(
                        this.audio.duration,
                        this.audio.currentTime + 10,
                    );
                }
            },
        );

        this.audio.volume = 0.8;

        this.el = el(
            'section.player',

            el(
                'div.player__track',
                this.coverElement,

                el(
                    'div.player__info',
                    this.titleElement,
                    this.artistElement,
                ),
            ),

            el(
                'div.player__controls',

                el(
                    'div.player__buttons',

                    el(
                        'button.player__button',
                        {
                            type: 'button',
                            'aria-label': 'Перемешать',
                        },
                        '↝',
                    ),

                    this.previousButton,

                    this.playButton,

                    this.nextButton,

                    el(
                        'button.player__button',
                        {
                            type: 'button',
                            'aria-label': 'Повторить',
                        },
                        '↻',
                    ),
                ),

                el(
                    'div.player__progress',

                    this.currentTimeElement,

                    this.progressRange,

                    this.durationElement,
                ),
            ),

            el(
                'div.player__volume',

                el(
                    'span.player__volume-icon',
                    '🔊',
                ),

                this.volumeRange,
            ),
        );
    }

    setTracks(tracks: Track[]): void {
        this.tracks = tracks;
    }

    setTrack(track: Track): void {
        this.currentTrack = track;

        this.audio.pause();
        this.audio.currentTime = 0;

        this.titleElement.textContent = track.title;
        this.artistElement.textContent = track.artist;

        this.currentTimeElement.textContent = '0:00';

        this.durationElement.textContent =
            formatDuration(track.duration);

        this.progressRange.value = '0';

        this.coverElement.replaceChildren();

        if (track.cover) {
            const image = el('img', {
                src: track.cover,
                alt: `Обложка трека ${track.title}`,
            });

            this.coverElement.append(image);
        } else {
            this.coverElement.append(
                el('span', '♫'),
            );
        }

        this.audio.src = track.audioUrl || `http://localhost:8000/api/tracks/${track.id}/audio`;
        
        this.audio.load();
    }

    private nextTrack(): void {
        if (
            !this.currentTrack ||
            this.tracks.length === 0
        ) {
            return;
        }

        const currentIndex =
            this.tracks.findIndex(
                (track) =>
                    track.id === this.currentTrack?.id,
            );

        if (currentIndex === -1) {
            return;
        }

        const nextIndex =
            (currentIndex + 1) % this.tracks.length;

        this.setTrack(
            this.tracks[nextIndex],
        );
    }

    private previousTrack(): void {
        if (
            !this.currentTrack ||
            this.tracks.length === 0
        ) {
            return;
        }

        const currentIndex =
            this.tracks.findIndex(
                (track) =>
                    track.id === this.currentTrack?.id,
            );

        if (currentIndex === -1) {
            return;
        }

        const previousIndex =
            currentIndex === 0
                ? this.tracks.length - 1
                : currentIndex - 1;

        this.setTrack(
            this.tracks[previousIndex],
        );
    }

    private async togglePlay(): Promise<void> {
        if (!this.currentTrack) {
            return;
        }

        if (this.audio.paused) {
            try {
                await this.audio.play();
            } catch (error: unknown) {
                console.error(
                    'Не удалось воспроизвести аудио:',
                    error,
                );
            }

            return;
        }

        this.audio.pause();
    }

    private seek(): void {
        if (!this.audio.duration) {
            return;
        }

        const percent = Number(
            this.progressRange.value,
        );

        this.audio.currentTime =
            (percent / 100) * this.audio.duration;
    }

    private updateProgress(): void {
        if (!this.audio.duration) {
            return;
        }

        const percent =
            (this.audio.currentTime /
                this.audio.duration) *
            100;

        this.progressRange.value =
            String(percent);

        this.currentTimeElement.textContent =
            formatDuration(
                this.audio.currentTime,
            );
    }

    private updateDuration(): void {
        if (!this.audio.duration) {
            return;
        }

        this.durationElement.textContent =
            formatDuration(this.audio.duration);
    }
}

function formatDuration(
    seconds: number,
): string {
    if (!Number.isFinite(seconds)) {
        return '0:00';
    }

    const minutes = Math.floor(
        seconds / 60,
    );

    const remainingSeconds = Math.floor(
        seconds % 60,
    );

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
}
