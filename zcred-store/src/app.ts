import { Config, type ConfigArgs } from './backbone/config.js';
import { HttpServer } from './backbone/http-server.js';
import { CredentialController } from './controllers/credential/credential.controller.js';
import { DbClient } from './backbone/db-client.js';
import { createInjector, Injector } from 'typed-inject';
import { CredentialStore } from './stores/credential.store.js';
import { CredentialService } from './services/credential.service.js';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth/auth.controller.js';
import { SecretDataController } from './controllers/secret-data/secret-data.controller.js';
import { CacheManager } from './backbone/cache-manager.js';

export type AppContext = {
  config: Config,
  httpServer: HttpServer,
  dbClient: DbClient,
  credentialService: CredentialService,
  credentialStore: CredentialStore,
  authService: AuthService,
  cacheManager: CacheManager,
}

export class App {
  #rootContext: Injector;
  #context: Injector<AppContext> | undefined;

  get context(): Injector<AppContext> {
    if (!this.#context) throw new Error('Use App.init method before');
    return this.#context;
  }

  private set context(context: Injector<AppContext>) {
    this.#context = context;
  }

  private constructor() {
    this.#rootContext = createInjector();
  }

  static async init(configArgs?: ConfigArgs): Promise<App> {
    const app = new App();
    app.context = app.#rootContext
      .provideValue('config', new Config(configArgs))
      .provideClass('dbClient', DbClient)
      .provideClass('cacheManager', CacheManager)
      .provideClass('httpServer', HttpServer)
      .provideClass('credentialStore', CredentialStore)
      .provideClass('credentialService', CredentialService)
      .provideClass('authService', AuthService);

    // register services
    await app.context.resolve('httpServer').register();
    await app.context.resolve('authService').register();

    // register controllers
    CredentialController(app.context);
    AuthController(app.context);
    SecretDataController(app.context);

    return app;
  }

  async run() {
    await this.context.resolve('httpServer').listen();
  }

  async close() {
    await this.#rootContext.dispose();
  }
}
