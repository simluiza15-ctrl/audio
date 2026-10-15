import { el, type RedomComponent } from 'redom';

export interface SidebarCallbacks {
    onTracks: () => void;
    onFavorites: () => void;
}

export class Sidebar implements RedomComponent {
    el: HTMLElement;

    constructor(callbacks: SidebarCallbacks) {
        const logo = el(
            'div.sidebar__logo',
            el(
                'img.sidebar__logo-mark',
                {
                    src: new URL(
                        '../assets/mithosis.svg',
                        import.meta.url,
                    ).toString(),
                    alt: 'VibeCast Studio',
                    width: '33',
                    height: '28',
                },
            ),
            el(
                'span.sidebar__logo-text',
                'VibeCast Studio',
            ),
        );

        const tracksLink = el(
            'button.sidebar__link.sidebar__link--active',
            {
                type: 'button',
            },
            el(
                'span.sidebar__icon',
                '♫',
            ),
            el(
                'span.sidebar__link-text',
                'Аудиокомпозиции',
            ),
        ) as HTMLButtonElement;

        const favoritesLink = el(
            'button.sidebar__link',
            {
                type: 'button',
            },
            el(
                'span.sidebar__icon',
                '♡',
            ),
            el(
                'span.sidebar__link-text',
                'Избранное',
            ),
        ) as HTMLButtonElement;

        tracksLink.addEventListener(
            'click',
            () => {
                tracksLink.classList.add(
                    'sidebar__link--active',
                );

                favoritesLink.classList.remove(
                    'sidebar__link--active',
                );

                callbacks.onTracks();
            },
        );

        favoritesLink.addEventListener(
            'click',
            () => {
                favoritesLink.classList.add(
                    'sidebar__link--active',
                );

                tracksLink.classList.remove(
                    'sidebar__link--active',
                );

                callbacks.onFavorites();
            },
        );

        const nav = el(
            'nav.sidebar__nav',
            tracksLink,
            favoritesLink,
        );

        this.el = el(
            'aside.sidebar',
            logo,
            nav,
        );
    }
}
