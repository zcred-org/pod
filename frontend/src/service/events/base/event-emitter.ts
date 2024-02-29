import { isEqual } from 'lodash';

type Handler<T> = (...args: [T] extends [never] ? [] : [T]) => Promise<void> | void;
type EmitParams<T> = [T] extends [never] ? [] : [T];


export class AppEvent<T = never> {
  private static logging = import.meta.env.DEV;

  private prevArgs: EmitParams<T>[0] | null = null;
  private handlers = new Set<Handler<T>>();

  constructor(
    private readonly eventName: string,
    private readonly isIgnoreEqualArgs = false,
  ) {}

  public readonly emit = (...args: EmitParams<T>): void => {
    if (this.checkCanEmit(args)) {
      AppEvent.logging && console.log(this.eventName, `emit(${args[0]}) to ${this.handlers.size}`);
      for (const handler of this.handlers) {
        handler(...args);
      }
    }
  };

  public readonly emitAsync = async (...args: EmitParams<T>): Promise<void> => {
    if (this.checkCanEmit(args)) {
      AppEvent.logging && console.log(this.eventName, `emitAsync(${args[0]}) to ${this.handlers.size}`);
      const handlers = Array.from(this.handlers);
      await Promise.all(handlers.map(handler => handler(...args)));
    }
  };

  public readonly subscribe = (handler: Handler<T>) => {
    const prevSize = this.handlers.size;
    this.handlers.add(handler);
    AppEvent.logging && console.log(this.eventName,
      `subscribe(${handler.name}) (${prevSize} -> ${this.handlers.size})`,
    );
  };

  public readonly unsubscribe = (handler: Handler<T>) => {
    const prevSize = this.handlers.size;
    this.handlers.delete(handler);
    AppEvent.logging && console.log(this.eventName,
      `unsubscribe(${handler.name}) (${prevSize} -> ${this.handlers.size})`,
    );
  };

  private checkCanEmit([args]: EmitParams<T>) {
    if (this.isIgnoreEqualArgs) {
      if (isEqual(args, this.prevArgs)) {
        return false;
      }
      this.prevArgs = args;
    }
    return true;
  }
}
