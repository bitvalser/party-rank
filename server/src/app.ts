import * as bodyParser from 'body-parser';
import * as cors from 'cors';
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

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    mongoose.connect(process.env.MONGODB_URL);
    this.config();
  }

  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        credentials: true,
        origin: ['http://localhost:3001', 'https://party-rank.web.app', 'https://party-rank-dev.web.app'],
      }),
    );
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
  }
}

const app = new App();
export default app;
