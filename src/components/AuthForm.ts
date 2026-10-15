import { el, type RedomComponent } from 'redom';

export type AuthMode = 'login' | 'register';

export interface AuthFormCallbacks {
    onSubmit: (
        username: string,
        password: string,
        mode: AuthMode,
    ) => void;
}

export class AuthForm implements RedomComponent {
    el: HTMLElement;

    private readonly usernameInput: HTMLInputElement;
    private readonly passwordInput: HTMLInputElement;
    private readonly form: HTMLFormElement;

    constructor(
        callbacks: AuthFormCallbacks,
        mode: AuthMode = 'login',
    ) {
        this.usernameInput = el('input.auth-form__input') as HTMLInputElement;
        this.passwordInput = el('input.auth-form__input') as HTMLInputElement;

        this.usernameInput.type = 'text';
        this.usernameInput.placeholder = 'Имя пользователя';
        this.usernameInput.required = true;

        this.passwordInput.type = 'password';
        this.passwordInput.placeholder = 'Пароль';
        this.passwordInput.required = true;

        this.form = el(
            'form.auth-form',
            el('h2.auth-form__title', mode === 'login' ? 'Вход' : 'Регистрация'),
            this.usernameInput,
            this.passwordInput,
            el(
                'button.auth-form__submit',
                {
                    type: 'submit',
                },
                mode === 'login' ? 'Войти' : 'Зарегистрироваться',
            ),
        ) as HTMLFormElement;

        this.form.addEventListener('submit', (event: SubmitEvent) => {
            event.preventDefault();

            callbacks.onSubmit(
                this.usernameInput.value.trim(),
                this.passwordInput.value,
                mode,
            );
        });

        this.el = this.form;
    }
}
