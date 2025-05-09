import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as http from 'http';
import mongoose from 'mongoose';

import './dotenv';
import { appCdnRouter } from './routes/cdn.routes';
import { appDiscordRouter } from './routes/discord.routes';
import { appPartiesRouter } from './routes/parties.routes';
import { appPartyItemsRouter } from './routes/party-items.routes';
import { appTagsRouter } from './routes/tags.routes';
import { appTestRouter } from './routes/test.routes';
import { appUsersRouter } from './routes/users.routes';

class App {
  public app: express.Application;
  public server: http.Server;
  public botClient: Client;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.botClient = new Client({ intents: [GatewayIntentBits.Guilds] });

    mongoose.connect(process.env.MONGODB_URL);
    this.config();
    this.botClient.login(process.env.DISCORD_BOT_TOKEN);
  }

  private config(): void {
    // Create a new client instance
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        credentials: true,
        origin: ['http://localhost:3001', 'https://party-rank.web.app', 'https://party-rank-dev.web.app'],
      }),
    );
    this.app.use(
      fileUpload({
        limits: { fileSize: 100 * 1024 * 1024 },
        useTempFiles: true,
        tempFileDir: '/temp-assets/',
        abortOnLimit: true,
      }),
    );
    this.app.use('/test', appTestRouter);
    this.app.use('/discord', appDiscordRouter);
    this.app.use('/parties', appPartiesRouter);
    this.app.use('/items', appPartyItemsRouter);
    this.app.use('/users', appUsersRouter);
    this.app.use('/tags', appTagsRouter);
    this.app.use('/cdn', appCdnRouter);
    this.app.use((err, req, res, next) => {
      if (err) {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
      }
    });

    this.botClient.once(Events.ClientReady, (readyClient) => {
      // eslint-disable-next-line no-console
      console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });
  }
}

const app = new App();
export default app;
