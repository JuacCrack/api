//cart router

import { Hono } from 'hono';
import { userController } from '../controllers/userController';

export const userRouter = new Hono();

const controller = new userController();

// route login
userRouter.post('/login', (c) => controller.login(c));
// route logout
userRouter.post('/logout', (c) => controller.logout(c));
