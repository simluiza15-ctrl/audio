
import { el, type RedomComponent } from 'redom';
import {
    AuthForm,
    type AuthMode,
} from './AuthForm';
import { AuthController } from '../controllers/AuthController';
import { TracksController } from '../controllers/TracksController';
import { Header } from './Header';
import {
    Sidebar,
    type SidebarCallbacks,
} from './Sidebar';
import { TrackList } from './TrackList';
import { Player } from './Player';
import { getUser, isAuthenticated } from '../store/auth';
import type { Track } from '../types/api';

export class App implements RedomComponent {
    el: HTMLElement;

    constructor() {
        const player = new Player();

        const authSection = el('section.app__auth');
        const authController = new AuthController();
        const tracksController = new TracksController(player);

        let allTracks: Track[] = [];
        let favoriteTracks: Track[] = [];
        let currentMode: AuthMode = 'login';

        const trackList = new TrackList(
            (track) => {
                player.setTrack(track);
            },
            (track) => {
                void handleFavorite(track);
            },
        );

        const handleFavorite = async (track: Track): Promise<void> => {
            try {
                await tracksController.toggleFavorite(track);
                await loadData();
            } catch (error: unknown) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Не удалось изменить избранное';

                console.error(message);
            }
        };

        const loadData = async (): Promise<void> => {
            allTracks = await tracksController.loadTracksData();
            favoriteTracks = await tracksController.loadFavoritesData();

            trackList.setFavorites(favoriteTracks);
            trackList.setTracks(
                showFavorites ? favoriteTracks : allTracks,
            );
            player.setTracks(allTracks);
        };

        let showFavorites = false;

        const showTracks = (): void => {
            showFavorites = false;
            trackList.setTracks(allTracks);
            updateMobileTabs();
        };

        const showFavoritesList = (): void => {
            showFavorites = true;
            trackList.setTracks(favoriteTracks);
            updateMobileTabs();
        };

        const mobileTabs = el(
            'nav.mobile-page-tabs',
            el(
                'button.mobile-page-tabs__button.mobile-page-tabs__button--active',
                {
                    type: 'button',
                    onclick: () => showTracks(),
                },
                el('span', '♫'),
                'Аудиокомпозиции',
            ),
            el(
                'button.mobile-page-tabs__button',
                {
                    type: 'button',
                    onclick: () => showFavoritesList(),
                },
                el('span', '♡'),
                'Избранное',
            ),
        );

        const updateMobileTabs = (): void => {
            const buttons = mobileTabs.querySelectorAll('button');

            buttons[0]?.classList.toggle(
                'mobile-page-tabs__button--active',
                !showFavorites,
            );
            buttons[1]?.classList.toggle(
                'mobile-page-tabs__button--active',
                showFavorites,
            );
        };

        const sidebarCallbacks: SidebarCallbacks = {
            onTracks: showTracks,
            onFavorites: showFavoritesList,
        };

        const sidebar = new Sidebar(sidebarCallbacks);

        const header = new Header({
            onTracks: showTracks,
            onFavorites: showFavoritesList,
            onProfile: () => {
                showAuthForm('login');
                authSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            },
        });

        const user = getUser();

        if (user) {
            header.setUsername(user.username);
        }

        const switchButton = el(
            'button.auth-switch',
            {
                type: 'button',
            },
            'Нет аккаунта? Зарегистрироваться',
        );

        const showAuthForm = (mode: AuthMode): void => {
            currentMode = mode;
            authSection.replaceChildren();

            const authForm = new AuthForm(
                {
                    onSubmit: async (username, password, formMode) => {
                        try {
                            await authController.submit(
                                username,
                                password,
                                formMode,
                            );

                            if (formMode === 'login') {
                                console.log('Авторизация успешна');
                                await loadData();
                            } else {
                                console.log('Регистрация успешна');
                                showAuthForm('login');
                            }
                        } catch (error: unknown) {
                            const message =
                                error instanceof Error
                                    ? error.message
                                    : 'Произошла ошибка авторизации';

                            console.error(message);
                        }
                    },
                },
                mode,
            );

            authSection.append(authForm.el, switchButton);

            switchButton.textContent =
                mode === 'login'
                    ? 'Нет аккаунта? Зарегистрироваться'
                    : 'Уже есть аккаунт? Войти';
        };

        switchButton.addEventListener('click', () => {
            showAuthForm(
                currentMode === 'login' ? 'register' : 'login',
            );
        });

        if (isAuthenticated()) {
            void loadData();
        } else {
            showAuthForm('login');
        }

        const main = el(
            'main.app__main',
            mobileTabs,
            el('h1', 'Аудиофайлы и треки'),
            authSection,
            trackList,
        );

        this.el = el(
            'div.app',
            sidebar,
            el(
                'div.app__content',
                header,
                main,
            ),
            player,
        );
    }
}
