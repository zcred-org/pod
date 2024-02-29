import { Config } from "./backbone/config.js";
import { Logger } from "./backbone/logger.js";
import { DbClient } from "./backbone/db-client.js";
import { createInjector, Injector } from "typed-inject";
import { HttpServer } from "./backbone/http-server.js";
import { ProgramStore } from "./stores/program.store.js";
import { ProgramService } from "./services/program.service.js";
import { ProgramController } from "./controllers/program.controller.js";

export type AppContext = {
  config: Config;
  logger: Logger;
  dbClient: DbClient;
  httpServer: HttpServer;
  programStore: ProgramStore;
  programService: ProgramService;
}

export class App {

  readonly rootContext: Injector;
  private _context: Injector<AppContext> | undefined;

  get context() {
    if (this._context) return this._context;
    throw new Error(`Init application first`);
  }

  set context(context: Injector<AppContext>) {
    this._context = context;
  }

  private constructor() {
    this.rootContext = createInjector();
  }

  static async init(): Promise<App> {
    const app = new App();
    app.context = app.rootContext
      .provideClass("logger", Logger)
      .provideClass("config", Config)
      .provideClass("dbClient", DbClient)
      .provideClass("httpServer", HttpServer)
      .provideClass("programStore", ProgramStore)
      .provideClass("programService", ProgramService);

    await app.context.resolve("httpServer").register();

    ProgramController(app.context);
    return app;
  }

  async run() {
    this.context.resolve("httpServer").listen();
  }

  async close() {
    await this.rootContext.dispose();
  }
}