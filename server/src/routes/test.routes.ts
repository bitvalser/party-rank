import { Router } from 'express';

import { AppTestController } from '../controllers/test.controller';
import { catchRoute } from '../core/catch-route';

export const appTestRouter = Router();
const appTestController = new AppTestController();

appTestRouter.get('/connection', catchRoute(appTestController.testConnection));
