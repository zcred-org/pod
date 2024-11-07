import { effect, type Signal, type ReadonlySignal, signal as _signal, computed as _computed } from '@preact/signals-react';
import { deepSignal as _deepSignal, type DeepSignal } from 'deepsignal/react';
import { set } from 'lodash-es';
import { config } from '@/config';

// Main signal-holder for tracking other signals values in effect below
const tracking = config.isDev && window.__REDUX_DEVTOOLS_EXTENSION__
  ? _signal<Record<string, ReadonlySignal<unknown> | DeepSignal<unknown>>>({})
  : undefined;

if (tracking) {
  // To avoid changes of tracking signal at app entire code initialization,
  // use setTimeout to create effect in the next event loop macro task.
  setTimeout(() => {
    const connection = window.__REDUX_DEVTOOLS_EXTENSION__!.connect({});
    const getState = () => {
      const _tracking = tracking.value;
      return Object.keys(_tracking).reduce<object>((acc, key) => {
        const signal = _tracking[key];
        if (typeof signal === 'object' && signal) {
          if ('value' in signal) return set(acc, key, signal.value);
        }
        return set(acc, key, { ...(signal || {}) });
      }, {});
    };
    let isInit = true;
    effect(() => isInit
      ? connection.init(getState())
      : connection.send({ type: 'anonymous' }, getState()));
    isInit = false;
  });
}

function track<D, T extends Signal<D> | ReadonlySignal<D> | DeepSignal<D>>(signal: T, path?: string): T {
  if (tracking && path) tracking.value = { ...tracking.peek(), [path]: signal };
  return signal;
}

export function signal<T>(value: T, name?: string): Signal<T> {
  return track(_signal(value), name);
}

export function computed<T>(fn: () => T, name?: string): ReadonlySignal<T> {
  return track(_computed(fn), name);
}

export function deepSignal<T extends object>(obj: T, name?: string): DeepSignal<T> {
  return track(_deepSignal(obj), name);
}
