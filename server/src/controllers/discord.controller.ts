import { Request, Response } from 'express';
import * as JWT from 'jsonwebtoken';
import fetch from 'node-fetch';

import { sendError } from '../core/response-helper';
import { DiscordOauthModel, UserModel } from '../models';
import { UserRole } from '../types';

export class AppDiscordController {
  static CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  static CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  static REDIRECT_URL = process.env.REDIRECT_URL;
  static API_URL = 'https://discord.com/api';

  constructor() {
    this.auth = this.auth.bind(this);
  }

  public async auth(req: Request, res: Response) {
    const { code, state } = req.query;

    if (code) {
      try {
        const tokenResponseData = await fetch(`${AppDiscordController.API_URL}/oauth2/token`, {
          method: 'POST',
          body: new URLSearchParams({
            client_id: AppDiscordController.CLIENT_ID,
            client_secret: AppDiscordController.CLIENT_SECRET,
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: AppDiscordController.REDIRECT_URL,
            scope: 'identify',
          }).toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }).then((response) => response.json());
        if (tokenResponseData.error) {
          return sendError(res, tokenResponseData.error_description || tokenResponseData.error, 401);
        }
        const expiresAt = Date.now() + tokenResponseData.expires_in;
        const userResult = await fetch(`${AppDiscordController.API_URL}/users/@me`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `${tokenResponseData.token_type} ${tokenResponseData.access_token}`,
          },
        })
          .then((response) => response.json())
          .catch((error) => {
            console.error(error);
          });
        if (userResult && userResult.code !== 0) {
          const displayName = userResult.global_name || userResult.username;

          const isDiscordAuthUserExists = await DiscordOauthModel.exists({ id: userResult.id });
          if (isDiscordAuthUserExists) {
            const oauthUser = await DiscordOauthModel.findOne({ id: userResult.id });
            oauthUser.accessToken = tokenResponseData.access_token;
            oauthUser.refreshToken = tokenResponseData.refresh_token;
            oauthUser.expiresAt = expiresAt;
            await oauthUser.save();

            const user = await UserModel.findOne({ _id: oauthUser.uid });
            if (!user) {
              throw new Error(`User with id ${oauthUser.uid} was not found`);
            }
            user.displayName = displayName;
            user.photoURL = userResult.avatar
              ? `https://cdn.discordapp.com/avatars/${userResult.id}/${userResult.avatar}.png`
              : null;
            await user.save();

            const customToken = JWT.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
            return res.redirect(
              `${process.env.APP_URL || 'http://localhost:3001'}/discord-oauth?token=${customToken}&state=${state}`,
            );
          } else {
            try {
              const newUser = await UserModel.create({
                displayName,
                photoURL: userResult.avatar
                  ? `https://cdn.discordapp.com/avatars/${userResult.id}/${userResult.avatar}.png`
                  : null,
                role: UserRole.Regular,
              });
              await DiscordOauthModel.create({
                id: `${userResult.id}`,
                uid: newUser._id,
                accessToken: tokenResponseData.access_token,
                expiresAt,
                refreshToken: tokenResponseData.refresh_token,
              });
              const customToken = JWT.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET);
              return res.redirect(`${process.env.APP_URL}/discord-oauth?token=${customToken}&state=${state}`);
            } catch (error) {
              console.error(error);
              return sendError(res, error.message, 403);
            }
          }
        } else {
          return sendError(res, 'Discord user not found', 403);
        }
      } catch (error) {
        console.error(error);
        return sendError(res, error.message, 401);
      }
    }
    return sendError(res, 'Auth code is required', 401);
  }
}
