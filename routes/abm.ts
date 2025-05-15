import { Hono } from 'hono';
import { abmController } from '../controllers/abmController';

export const abmRouter = new Hono();

const controller = new abmController();

abmRouter.post('/:table/:method/:where?', (c) => controller.main(c));
