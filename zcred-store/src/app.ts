import { Config } from './backbone/config.js';
import { HttpServer } from './backbone/http-server.js';
import { CredentialController } from './controllers/credential/credential.controller.js';
import { DataSource } from './backbone/db-client.js';
import { createInjector, Injector } from 'typed-inject';
import { CredentialStore } from './stores/credential.store.js';
import { CredentialService } from './services/credential.service.js';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth/auth.controller.js';

export type AppContext = {
  config: Config;
  httpServer: HttpServer;
  dataSource: DataSource;
  credentialService: CredentialService;
  credentialStore: CredentialStore;
  authService: AuthService;
}

export class App {

  readonly rootContext: Injector;
  private _context: Injector<AppContext> | undefined;

  get context() {
    if (this._context) return this._context;
    throw new Error(`Initialize application first`);
  }

  private set context(context: Injector<AppContext>) {
    this._context = context;
  }

  private constructor() {
    this.rootContext = createInjector();
  }

  static async init(): Promise<App> {
    const app = new App();
    app.context = app.rootContext
      .provideClass('config', Config)
      .provideClass('httpServer', HttpServer)
      .provideClass('dataSource', DataSource)
      .provideClass('credentialStore', CredentialStore)
      .provideClass('credentialService', CredentialService)
      .provideClass('authService', AuthService);

    // register services
    await app.context.resolve('httpServer').register();
    await app.context.resolve('authService').register();

    // register controllers
    CredentialController(app.context);
    AuthController(app.context);

    return app;
  }

  async run() {
    await this.context.resolve('httpServer').listen();
  }
}
