import { effect, type Signal, type ReadonlySignal, signal as _signal, computed as _computed } from '@preact/signals-react';
import { set } from 'lodash-es';

// Main signal-holder for tracking other signals values in effect below
const tracking = import.meta.env.DEV && window.__REDUX_DEVTOOLS_EXTENSION__
  ? _signal<Record<string, Signal<unknown>>>({})
  : undefined;

if (tracking) {
  const connection = window.__REDUX_DEVTOOLS_EXTENSION__!.connect({});
  const getState = () => Object.keys(tracking.value).reduce<object>((acc, key) => {
    return set(acc, key, tracking.peek()[key].value);
  }, {});
  connection.send({ type: 'init' }, getState());
  // To avoid changes of tracking signal at app entire code initialization,
  // use setTimeout to create effect in the next event loop macro task.
  setTimeout(() => effect(() => connection.send(
    { type: 'anonymous' },
    getState(),
  )), 100); // Macro task sometimes not helpful completely, then timeout is increased.
}

function track<D, T extends Signal<D> | ReadonlySignal<D>>(signal: T, path?: string): T {
  if (tracking && path) tracking.value = { ...tracking.value, [path]: signal };
  return signal;
}

export function signal<T>(value: T, name?: string): Signal<T> {
  return track(_signal(value), name);
}

export function computed<T>(compute: () => T, name?: string): ReadonlySignal<T> {
  return track(_computed(compute), name);
}
