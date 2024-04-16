import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as Discord from 'discord.js';
import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as admin from 'firebase-admin';
import * as http from 'http';

import { DiscordIntegration } from './classes/discord-integration.class';
import './dotenv';
import { appDiscordRouter } from './routes/discord.routes';
import { appTestRouter } from './routes/test.routes';
import { appUploadRouter } from './routes/upload.routes';

const serviceAccount = require('../my-project-1523693285732-firebase-adminsdk-f7ilt-b714af9a52.json');

class App {
  public app: express.Application;
  public server: http.Server;
  public discordBot: Discord.Client;
  public discordIntegration: DiscordIntegration;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.discordBot = new Discord.Client({
      intents: [],
      partials: [Discord.Partials.Channel, Discord.Partials.Message, Discord.Partials.GuildMember],
    });
    this.discordIntegration = new DiscordIntegration(this.discordBot);

    this.discordBot.login(process.env.BOT_TOKEN);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.config();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(cors({ credentials: true, origin: ['http://localhost:3001', 'https://party-rank.web.app'] }));
    this.app.use(
      fileUpload({
        limits: { fileSize: 20 * 1024 * 1024 },
        useTempFiles: true,
        tempFileDir: '/temp-assets/',
        abortOnLimit: true,
      }),
    );
    this.app.use('/test', appTestRouter);
    this.app.use('/discord', appDiscordRouter);
    this.app.use('/cdn', appUploadRouter);
    this.app.use((err, req, res, next) => {
      if (err) {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
      }
    });
  }
}

const app = new App();
export default app;
