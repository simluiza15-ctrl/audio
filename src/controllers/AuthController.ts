import { login, register } from '../api/client';
import { clearAuth, saveAuth } from '../store/auth';
import type { AuthMode } from '../components/AuthForm';

export class AuthController {
    async submit(
        username: string,
        password: string,
        mode: AuthMode,
    ): Promise<void> {
        if (!username || !password) {
            throw new Error('Введите имя пользователя и пароль');
        }

        if (mode === 'register') {
            const response = await register(username, password);

            console.log(response.message);

            return;
        }

        const response = await login(username, password);

        saveAuth(response.token, {
            username,
        });
    }

    logout(): void {
        clearAuth();
    }
}
