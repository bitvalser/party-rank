import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

import { sendError } from '../core/response-helper';

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

          const firebaseUser = await admin.app().firestore().collection('discord-oauth').doc(`${userResult.id}`).get();
          if (firebaseUser.exists) {
            const oauthUser = firebaseUser.data();
            await admin.app().firestore().collection('discord-oauth').doc(`${userResult.id}`).update({
              accessToken: tokenResponseData.access_token,
              expiresAt,
              refreshToken: tokenResponseData.refresh_token,
            });
            await admin
              .app()
              .auth()
              .updateUser(oauthUser.uid, {
                displayName,
                photoURL: `https://cdn.discordapp.com/avatars/${userResult.id}/${userResult.avatar}.png`,
              });
            await admin
              .app()
              .firestore()
              .collection('users')
              .doc(oauthUser.uid)
              .update({
                displayName,
                photoURL: `https://cdn.discordapp.com/avatars/${userResult.id}/${userResult.avatar}.png`,
              });
            const customToken = await admin.app().auth().createCustomToken(oauthUser.uid);
            return res.redirect(
              `${process.env.APP_URL || 'http://localhost:3001'}/discord-oauth?token=${customToken}&state=${state}`,
            );
          } else {
            let newUser = null;
            try {
              newUser = await admin
                .app()
                .auth()
                .createUser({
                  displayName,
                  photoURL: `https://cdn.discordapp.com/avatars/${userResult.id}/${userResult.avatar}.png`,
                });
              await admin
                .app()
                .firestore()
                .collection('discord-oauth')
                .doc(`${userResult.id}`)
                .set({
                  id: `${userResult.id}`,
                  uid: newUser.uid,
                  accessToken: tokenResponseData.access_token,
                  expiresAt,
                  refreshToken: tokenResponseData.refresh_token,
                });
              await admin
                .app()
                .firestore()
                .collection('users')
                .doc(newUser.uid)
                .set({
                  uid: newUser.uid,
                  displayName,
                  photoURL: `https://cdn.discordapp.com/avatars/${userResult.id}/${userResult.avatar}.png`,
                });
              const customToken = await admin.app().auth().createCustomToken(newUser.uid);
              return res.redirect(`${process.env.APP_URL}/discord-oauth?token=${customToken}&state=${state}`);
            } catch (error) {
              if (newUser) {
                admin.app().auth().deleteUser(newUser.uid);
              }
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
