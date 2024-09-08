import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as fsPromises from 'fs/promises';
import { nanoid } from 'nanoid';

import { sendError } from '../core/response-helper';

const ASSETS_FOLDER = '/var/www/html/assets';
const ALLOWED_EXTENSIONS = ['mp3', 'mp4'];

export class AppUploadController {
  constructor() {
    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async delete(req: Request, res: Response) {
    const fileId = req.params.fileId;
    if (!fileId) {
      return sendError(res, 'No file id provided.', 400);
    }
    if (!req.userId) {
      return sendError(res, 'Unauthorized.', 400);
    }
    const fileEntities = await admin.app().firestore().collection('cdn').doc(req.userId).get();
    const fileToDelete = (fileEntities.data() || {})[fileId];
    if (!fileToDelete) {
      return sendError(res, 'File not found.', 400);
    }
    await fsPromises.unlink(fileToDelete.path);
    await admin
      .app()
      .firestore()
      .collection('cdn')
      .doc(req.userId)
      .update({ [fileId]: admin.firestore.FieldValue.delete() });
    res.json({
      ok: true,
    });
  }

  public async upload(req: Request, res: Response) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return sendError(res, 'No files were uploaded.', 400);
    }

    const fileToUpload = req.files.file;
    const extension = fileToUpload.name.split('.').at(-1);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return sendError(res, 'Not allowed file extension.', 400);
    }

    const fileId = nanoid(8);
    const fileName = `${fileId}.${extension}`;
    const path = `${ASSETS_FOLDER}/${fileName}`;
    const fileUrl = `${process.env.ASSETS_URL || 'http://localhost:3001'}/${fileName}`;

    if (req.userId) {
      await admin
        .app()
        .firestore()
        .collection('cdn')
        .doc(req.userId)
        .set(
          {
            [fileId]: { id: fileId, created: new Date().toISOString(), name: fileToUpload.name, url: fileUrl, path },
          },
          { merge: true },
        );
    }

    fileToUpload.mv(path, (err) => {
      if (err) {
        return sendError(res, err?.message, 500);
      }

      res.json({
        ok: true,
        file: fileUrl,
      });
    });
  }
}
