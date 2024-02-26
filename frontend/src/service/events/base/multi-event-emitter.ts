import { compact, isEqual } from 'lodash';

type Listener<Args extends Array<unknown>> = (...args: Args) => void;

export class MultiEventEmitter<
  Events extends Record<string, Array<unknown>>,
  EventsKey extends (keyof Events) & string = (keyof Events) & string,
> {
  private static logging = import.meta.env.DEV;

  private eventListeners: {
    [EventName in EventsKey]?: Set<Listener<Events[EventName]>>;
  } = {};

  private prevArgs: {
    [EventName in EventsKey]?: Events[EventName];
  } = {};

  constructor(
    private readonly emitterName: string,
    private readonly isIgnoreEqualArgs = false,
  ) {}

  public readonly emit = (eventName: EventsKey, ...args: Events[EventsKey]) => {
    const listeners = Array.from(this.eventListeners[eventName] || []);
    if (!this.emitMiddleware(eventName, args, listeners)) return;
    for (const listener of listeners) {
      listener(...args);
    }
  };

  public readonly emitAsync = (eventName: EventsKey, ...args: Events[EventsKey]) => {
    const listeners = Array.from(this.eventListeners[eventName] || []);
    if (!this.emitMiddleware(eventName, args, listeners)) return;
    return Promise.all(Array.from(listeners).map(listener => listener(...args)));
  };

  public readonly subscribe = (eventName: EventsKey, listener: Listener<Events[EventsKey]>) => {
    const listeners = this.eventListeners[eventName] ?? new Set();
    listeners.add(listener);
    this.eventListeners[eventName] = listeners;
  };

  public readonly unsubscribe = (eventName: EventsKey, listener: Listener<Events[EventsKey]>) => {
    const listeners = this.eventListeners[eventName];
    if (listeners) {
      listeners.delete(listener);
    }
  };

  /**
   * Check args equality, log event
   * @return true if continue emit
   */
  private emitMiddleware(eventName: EventsKey, args: Events[EventsKey], listeners?: Array<() => void>) {
    const prevArgs = this.prevArgs[eventName];
    this.prevArgs[eventName] = args;
    const isContinue = !this.isIgnoreEqualArgs || !isEqual(args, prevArgs);
    if (isContinue && MultiEventEmitter.logging) {
      console.log(compact([
        `emit(${this.emitterName}.${eventName}, ${compact(args).join(', ')})`,
        ` to ${listeners?.map(({ name }) => name || 'anonymous').join(', ')}`,
      ]).join(''));
    }
    return isContinue;
  }
}
