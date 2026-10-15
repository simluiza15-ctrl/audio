
import { el, type RedomComponent } from 'redom';
import { Search } from './Search';

export interface HeaderCallbacks {
    onTracks: () => void;
    onFavorites: () => void;
    onProfile: () => void;
}

export class Header implements RedomComponent {
    el: HTMLElement;
    private usernameElement: HTMLElement;

    constructor(callbacks: HeaderCallbacks) {
        const tracksButton = el(
            'button.header__mobile-tab.header__mobile-tab--active',
            { type: 'button' },
            el('span.header__mobile-tab-icon', '♫'),
            'Аудиокомпозиции',
        ) as HTMLButtonElement;

        const favoritesButton = el(
            'button.header__mobile-tab',
            { type: 'button' },
            el('span.header__mobile-tab-icon', '♡'),
            'Избранное',
        ) as HTMLButtonElement;

        tracksButton.addEventListener('click', () => {
            tracksButton.classList.add('header__mobile-tab--active');
            favoritesButton.classList.remove('header__mobile-tab--active');
            callbacks.onTracks();
        });

        favoritesButton.addEventListener('click', () => {
            favoritesButton.classList.add('header__mobile-tab--active');
            tracksButton.classList.remove('header__mobile-tab--active');
            callbacks.onFavorites();
        });

        this.usernameElement = el(
            'span.header__username',
            'username',
        );

        const profile = el(
            'button.header__profile',
            {
                type: 'button',
                'aria-label': 'Открыть авторизацию',
            },
            el('div.header__avatar', '●'),
            this.usernameElement,
            el('span.header__chevron', '›'),
        ) as HTMLButtonElement;

        profile.addEventListener('click', () => {
            callbacks.onProfile();
        });

        const search = new Search();

        const top = el(
            'div.header__top',
            search,
            profile,
        );

        const mobileTabs = el(
            'nav.header__mobile-tabs',
            tracksButton,
            favoritesButton,
        );

        this.el = el(
            'header.header',
            top,
            mobileTabs,
        );
    }

    setUsername(username: string): void {
        this.usernameElement.textContent = username;
    }
}
