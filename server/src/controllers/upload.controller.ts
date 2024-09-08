import { Request, Response } from 'express';
import * as fsPromises from 'fs/promises';
import { nanoid } from 'nanoid';

import { sendError } from '../core/response-helper';
import { CdnItemModel } from '../models/cdn.model';

const ASSETS_FOLDER = '/var/www/html/assets';
const ALLOWED_EXTENSIONS = ['mp3', 'mp4'];

export class AppUploadController {
  constructor() {
    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
    this.getAll = this.getAll.bind(this);
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    const userEntry = await CdnItemModel.findOne({ userId: req.userId });

    if (!userEntry) {
      res.json({
        ok: true,
        data: [],
      });
      return;
    }

    res.json({
      ok: true,
      data: userEntry.assets.values(),
    });
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const fileId = req.params.fileId;
    if (!fileId) {
      return sendError(res, 'No file id provided.', 400);
    }

    const userEntry = await CdnItemModel.findOne({ userId: req.userId });
    const fileToDelete = userEntry.assets.get(fileId);
    if (!fileToDelete) {
      return sendError(res, 'File not found.', 400);
    }
    await fsPromises.unlink(fileToDelete.path);
    userEntry.assets.delete(fileId);
    await userEntry.save();

    res.json({
      ok: true,
    });
  }

  public async upload(req: Request, res: Response): Promise<void> {
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

    let userEntry = await CdnItemModel.findOne({ userId: req.userId });

    if (!userEntry) {
      userEntry = await CdnItemModel.create({
        userId: req.userId,
        assets: new Map(),
      });
    }

    userEntry.assets.set(fileId, {
      id: fileId,
      created: new Date(),
      name: fileToUpload.name,
      url: fileUrl,
      path,
    });

    fileToUpload.mv(path, async (err) => {
      if (err) {
        return sendError(res, err?.message, 500);
      }

      await userEntry.save();

      res.json({
        ok: true,
        data: fileUrl,
      });
    });
  }
}
