
import {
    el,
    mount,
    type RedomComponent,
} from 'redom';

import type { Track } from '../types/api';

import {
    TrackCard,
    type TrackCardCallbacks,
} from './TrackCard';

import { Pagination } from './Pagination';

const TRACKS_PER_PAGE = 8;
const MOBILE_BREAKPOINT = '(max-width: 700px)';
const LOAD_MORE_THRESHOLD = 300;

export class TrackList implements RedomComponent {
    el: HTMLElement;

    private readonly callbacks: TrackCardCallbacks;
    private readonly pagination: Pagination;

    private tracks: Track[] = [];
    private favoriteIds = new Set<number>();

    private currentPage = 1;
    private mobileVisibleCount = TRACKS_PER_PAGE;
    private isLoadingMore = false;

    private readonly isMobile = window.matchMedia(
        MOBILE_BREAKPOINT,
    );

    private readonly handleWindowScroll = (): void => {
        this.handleScroll();
    };

    private readonly handleBreakpointChange = (): void => {
        this.render();
    };

    constructor(
        onSelect: (track: Track) => void,
        onFavorite: (track: Track) => void,
        tracks: Track[] = [],
    ) {
        this.callbacks = {
            onSelect,
            onFavorite,
        };

        this.tracks = tracks;

        this.pagination = new Pagination({
            onPageChange: (page) => {
                this.currentPage = page;
                this.render();
            },
        });

        this.el = el(
            'section.track-list',
            el(
                'div.track-list__header',
                el('span.track-list__number', '№'),
                el('span.track-list__name', 'НАЗВАНИЕ'),
                el('span.track-list__album', 'АЛЬБОМ'),
                el('span.track-list__date', 'ДАТА'),
                el('span.track-list__favorite', '♡'),
                el('span.track-list__duration', 'ВРЕМЯ'),
                el('span.track-list__menu', ''),
            ),
        );

        window.addEventListener(
            'scroll',
            this.handleWindowScroll,
            { passive: true },
        );

        this.isMobile.addEventListener(
            'change',
            this.handleBreakpointChange,
        );

        this.render();
    }

    setTracks(tracks: Track[]): void {
        this.tracks = tracks;
        this.currentPage = 1;
        this.mobileVisibleCount = TRACKS_PER_PAGE;

        this.render();
    }

    setFavorites(tracks: Track[]): void {
        this.favoriteIds = new Set(
            tracks.map((track) => track.id),
        );

        this.render();
    }

    private render(): void {
        this.el
            .querySelectorAll('.track-card')
            .forEach((element) => element.remove());

        this.pagination.el.remove();

        if (this.isMobile.matches) {
            this.renderMobile();
            return;
        }

        this.renderDesktop();
    }

    private renderDesktop(): void {
        const totalPages = Math.ceil(
            this.tracks.length / TRACKS_PER_PAGE,
        );

        const safeTotalPages = Math.max(1, totalPages);

        if (this.currentPage > safeTotalPages) {
            this.currentPage = safeTotalPages;
        }

        const startIndex =
            (this.currentPage - 1) * TRACKS_PER_PAGE;

        const visibleTracks = this.tracks.slice(
            startIndex,
            startIndex + TRACKS_PER_PAGE,
        );

        this.renderTracks(visibleTracks, startIndex);

        this.pagination.setPages(
            this.currentPage,
            safeTotalPages,
        );

        this.el.append(this.pagination.el);
    }

    private renderMobile(): void {
        const visibleTracks = this.tracks.slice(
            0,
            this.mobileVisibleCount,
        );

        this.renderTracks(visibleTracks, 0);
    }

    private renderTracks(
        tracks: Track[],
        startIndex: number,
    ): void {
        tracks.forEach((track, index) => {
            mount(
                this.el,
                new TrackCard(
                    track,
                    startIndex + index,
                    this.callbacks,
                    this.favoriteIds.has(track.id),
                ),
            );
        });
    }

    private handleScroll(): void {
        if (
            !this.isMobile.matches ||
            this.isLoadingMore
        ) {
            return;
        }

        const distanceToBottom =
            document.documentElement.scrollHeight -
            (window.scrollY + window.innerHeight);

        if (distanceToBottom > LOAD_MORE_THRESHOLD) {
            return;
        }

        if (this.mobileVisibleCount >= this.tracks.length) {
            return;
        }

        this.isLoadingMore = true;

        this.mobileVisibleCount = Math.min(
            this.mobileVisibleCount + TRACKS_PER_PAGE,
            this.tracks.length,
        );

        this.render();
        this.isLoadingMore = false;
    }
}
