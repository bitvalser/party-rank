import { Router } from 'express';

import { AppPartiesController } from '../controllers/parties.controller';
import { AppPartyItemsController } from '../controllers/party-items.controller';
import { AppUserRankController } from '../controllers/user-rank.controller';
import { catchRoute } from '../core/catch-route';
import { protect } from '../core/protect-middleware';
import { UserRole } from '../types';

export const appPartiesRouter = Router();
const appPartiesController = new AppPartiesController();
const appPartyItemsController = new AppPartyItemsController();
const appUserRankController = new AppUserRankController();

appPartiesRouter.post('/', protect({ role: [UserRole.Creator] }), catchRoute(appPartiesController.createPartyRank));
appPartiesRouter.post('/search', protect(), catchRoute(appPartiesController.searchPartyRanks));
appPartiesRouter.get('/:id', protect(), catchRoute(appPartiesController.getPartyRankById));
appPartiesRouter.delete('/:id', protect(), catchRoute(appPartiesController.deletePartyRankById));
appPartiesRouter.patch('/:id', protect(), catchRoute(appPartiesController.updatePartyRank));
appPartiesRouter.post('/:id/add-user', protect(), catchRoute(appPartiesController.addUserToPartyRank));
appPartiesRouter.post('/:id/register', protect(), catchRoute(appPartiesController.registerToPartyRank));
appPartiesRouter.post('/:id/unregister', protect(), catchRoute(appPartiesController.unregisterFromPartyRank));
appPartiesRouter.post('/:id/kick', protect(), catchRoute(appPartiesController.kickUserFromPartyRank));

appPartiesRouter.post('/:partyRankId/items', protect(), catchRoute(appPartyItemsController.addItemToPartyRank));
appPartiesRouter.get('/:partyRankId/items', protect(), catchRoute(appPartyItemsController.getItemsByPartyRankId));

appPartiesRouter.post('/:partyRankId/rank', protect(), catchRoute(appUserRankController.setUserRank));
appPartiesRouter.get('/:partyRankId/ranks', protect(), catchRoute(appUserRankController.getUserRanks));
appPartiesRouter.get('/:partyRankId/my-rank', protect(), catchRoute(appUserRankController.getMyRank));
appPartiesRouter.delete('/:partyRankId/rank/:userId', protect(), catchRoute(appUserRankController.deleteUserRank));
