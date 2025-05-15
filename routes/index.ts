import { Hono } from 'hono';
import { abmRouter } from './abm';
import { cartRouter } from './cart';
import { userRouter } from './user';


export const apiRouter = new Hono();

apiRouter.route('/abm', abmRouter);

apiRouter.route('/carrito', cartRouter);

