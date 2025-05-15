import type { Context } from 'hono';
import { AbmService } from '../services/abmService';

export class abmController {
    async main(c: Context): Promise<Response> {
        try {
            const { table, method, where } = c.req.param();
            if (!table || !method) {
                throw new Error('Missing required parameters: table or method');
            }
            const body = (await c.req.json().catch(() => null)) || {};
            const result = await AbmService.handle({ table, method, where: where || undefined, body });
            return c.json({ success: true, data: result });
        } catch (error) {
            console.error('Error in AbmController:', error);
            return c.json({ message: 'Internal server error', error: (error as any)?.message }, 500);
        }
    }
}
