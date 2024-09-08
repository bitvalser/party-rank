import { Router } from 'express';

import { AppTagsController } from '../controllers/tags.controller';
import { catchRoute } from '../core/catch-route';

export const appTagsRouter = Router();
const appTagsController = new AppTagsController();

appTagsRouter.get('/', catchRoute(appTagsController.getAll));
