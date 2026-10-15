import { el, type RedomComponent } from 'redom';

export interface PaginationCallbacks {
    onPageChange: (page: number) => void;
}

export class Pagination implements RedomComponent {
    el: HTMLElement;

    private readonly callbacks: PaginationCallbacks;
    private currentPage = 1;
    private totalPages = 1;

    constructor(
        callbacks: PaginationCallbacks,
    ) {
        this.callbacks = callbacks;

        this.el = el(
            'nav.pagination',
            {
                'aria-label': 'Пагинация треков',
            },
        );

        this.render();
    }

    setPages(
        currentPage: number,
        totalPages: number,
    ): void {
        this.currentPage = currentPage;
        this.totalPages = Math.max(
            1,
            totalPages,
        );

        this.render();
    }

    private render(): void {
        this.el.replaceChildren();

        if (this.totalPages <= 1) {
            return;
        }

        const previousButton =
            this.createButton(
                '‹',
                'Предыдущая страница',
                this.currentPage - 1,
            );

        previousButton.disabled =
            this.currentPage === 1;

        this.el.append(previousButton);

        for (
            let page = 1;
            page <= this.totalPages;
            page += 1
        ) {
            const pageButton =
                this.createButton(
                    String(page),
                    `Страница ${page}`,
                    page,
                );

            if (page === this.currentPage) {
                pageButton.classList.add(
                    'pagination__button--active',
                );
                pageButton.setAttribute(
                    'aria-current',
                    'page',
                );
            }

            this.el.append(pageButton);
        }

        const nextButton =
            this.createButton(
                '›',
                'Следующая страница',
                this.currentPage + 1,
            );

        nextButton.disabled =
            this.currentPage === this.totalPages;

        this.el.append(nextButton);
    }

    private createButton(
        text: string,
        ariaLabel: string,
        page: number,
    ): HTMLButtonElement {
        const button = el(
            'button.pagination__button',
            {
                type: 'button',
                'aria-label': ariaLabel,
            },
            text,
        ) as HTMLButtonElement;

        button.addEventListener(
            'click',
            () => {
                if (
                    page < 1 ||
                    page > this.totalPages ||
                    page === this.currentPage
                ) {
                    return;
                }

                this.callbacks.onPageChange(page);
            },
        );

        return button;
    }
}
