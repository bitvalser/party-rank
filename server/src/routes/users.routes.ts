import { Router } from 'express';

import { AppUsersController } from '../controllers/users.controller';
import { catchRoute } from '../core/catch-route';
import { protect } from '../core/protect-middleware';

export const appUsersRouter = Router();
const appUsersController = new AppUsersController();

appUsersRouter.get('/me', protect(), catchRoute(appUsersController.getMe));
appUsersRouter.get('/:id', catchRoute(appUsersController.getUserById));
appUsersRouter.post('/search', catchRoute(appUsersController.searchUsers));
