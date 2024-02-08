import { Router } from 'express';

import { AppDiscordController } from '../controllers/discord.controller';
import { catchRoute } from '../core/catch-route';

export const appDiscordRouter = Router();
const appDiscordController = new AppDiscordController();

appDiscordRouter.get('/auth', catchRoute(appDiscordController.auth));
