import { el, type RedomComponent } from 'redom';

export class Search implements RedomComponent {
    el: HTMLElement;

    constructor() {
        this.el = el(
            'div.search',
            el('input.search__input', {
                type: 'search',
                placeholder: 'Поиск',
                'aria-label': 'Поиск треков',
            }),
        );
    }
}
