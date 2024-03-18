import { Router } from 'express';

import { AppUploadController } from '../controllers/upload.controller';
import { catchRoute } from '../core/catch-route';
import { firebaseAuth } from '../core/firebase-auth';

export const appUploadRouter = Router();
const appUploadController = new AppUploadController();

appUploadRouter.post('/upload', firebaseAuth, catchRoute(appUploadController.upload));
appUploadRouter.delete('/delete/:fileId', firebaseAuth, catchRoute(appUploadController.delete));
