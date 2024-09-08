import { Router } from 'express';

import { AppPartyItemsController } from '../controllers/party-items.controller';
import { catchRoute } from '../core/catch-route';
import { protect } from '../core/protect-middleware';

export const appPartyItemsRouter = Router();
const appPartyItemsController = new AppPartyItemsController();

appPartyItemsRouter.post('/search', protect(), catchRoute(appPartyItemsController.searchItems));
appPartyItemsRouter.patch('/:itemId', protect(), catchRoute(appPartyItemsController.updateItemToPartyRank));
appPartyItemsRouter.delete('/:itemId', protect(), catchRoute(appPartyItemsController.deleteItemFromPartyRank));

appPartyItemsRouter.post('/:itemId/comments', protect(), catchRoute(appPartyItemsController.addPartyItemComment));
appPartyItemsRouter.delete(
  '/:itemId/comments/:commentId',
  protect(),
  catchRoute(appPartyItemsController.deletePartyItemComment),
);
