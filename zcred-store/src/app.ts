import { Config } from './backbone/config.js';
import { ROOT_DIR } from './util/index.js';
import { HttpServer } from './backbone/http-server.js';
import { CredentialController } from './controller/credential/credential.controller.js';
import { DataSource } from './backbone/db-client.js';

export type AppContext = {
  config: Config;
  httpServer: HttpServer;
  dataSource: DataSource;
}

export class App {
  private _context?: AppContext;

  get context() {
    if (this._context) return this._context;
    throw new Error(`Initialize application first`);
  }

  private constructor() {}

  static async init(): Promise<App> {
    const app = new App();
    const config = new Config(new URL("../.env", ROOT_DIR));
    const httpServer = new HttpServer(config);
    await httpServer.register();
    app._context = {
      config,
      httpServer,
      dataSource: new DataSource(config),
    };
    CredentialController(app.context);
    return app;
  }

  async run() {
    await this.context.httpServer.listen();
    console.log(`App successfully launched on port ${this.context.config.port}`);
  }
}
