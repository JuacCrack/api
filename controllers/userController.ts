import type { Context } from 'hono';
import { userService } from '../services/userService';

export class userController {

    // Login method
    async login(c: Context) {
        try {
            const { username, password } = await c.req.json();
            if (!username || !password) {
                return c.json({ error: 'Username and password are required' }, 400);
            }

            const result = await userService.login({ username, password });
            return c.json(result, 201);
        } catch (error) {
            return c.json({ error: 'An error occurred during login' }, 500);
        }
    }

    // Logout method
    async logout(c: Context) {
        try {
            const result = await userService.logout();
            return c.json(result, 201);
        } catch (error) {
            return c.json({ error: 'An error occurred during logout' }, 500);
        }
    }

}
