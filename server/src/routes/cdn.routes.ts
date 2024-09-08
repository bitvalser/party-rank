import { Router } from 'express';

import { AppUploadController } from '../controllers/upload.controller';
import { catchRoute } from '../core/catch-route';
import { protect } from '../core/protect-middleware';

export const appCdnRouter = Router();
const appCdnController = new AppUploadController();

appCdnRouter.get('/all', protect(), catchRoute(appCdnController.getAll));
appCdnRouter.post('/upload', protect(), catchRoute(appCdnController.upload));
appCdnRouter.delete('/delete/:fileId', protect(), catchRoute(appCdnController.delete));
