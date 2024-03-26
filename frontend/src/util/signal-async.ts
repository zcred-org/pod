import { type ReadonlySignal } from '@preact/signals-react';
import type { OverrideProperties } from 'type-fest';
import { signal } from '@/util/signals-dev-tools.ts';

type StateAbstract<Data> = {
  isIdle: false;
  isLoading: false;
  isError: false;
  isSuccess: false;
  data?: Data;
  error?: Error;
}

type State<Data, Args extends SignalAsyncArgs<Data>> = OverrideProperties<StateAbstract<Data>, {
  isIdle: true,
  data: Args['initData'] extends Data ? Data : undefined,
  error: undefined,
}> | OverrideProperties<StateAbstract<Data>, {
  isLoading: true,
  data: Args['initData'] extends Data ? Data
    : Args['staleDataOnLoading'] extends true ? Data | undefined
      : undefined,
}> | OverrideProperties<StateAbstract<Data>, {
  isSuccess: true,
  data: Data,
  error: undefined,
}> | OverrideProperties<StateAbstract<Data>, {
  data: Args['initData'] extends Data ? Data : undefined,
  isError: true,
  error: Error,
}>

type Actions<Data> = {
  loading: () => void;
  resolve: (...args: Data extends undefined ? [] : [Data]) => void;
  reject: (error: Error) => void;
  reset: () => void;
}

type SignalAsyncArgs<Data> = {
  /** If true and data was previously received, it will not be cleared on next loading */
  staleDataOnLoading?: boolean | undefined;
  /** Initial data, then data will not be undefined on all statuses. For example an empty array. */
  initData?: Data | undefined;
  /** Signal name for devtools */
  name?: string | undefined;
}

type SignalAsync<Data, Args extends SignalAsyncArgs<Data>> =
  ReadonlySignal<State<Data, Args>>
  & Actions<Data>;

/**
 * Signal with async type-safe union state management.
 * @example
 * const $signal = signalAsync<DataType>()(args) // Creating
 *
 * $signal.loading() // set isLoading;
 * $signal.resolve(data) // set isSuccess;
 * $signal.reject(error) // set isError;
 * $signal.reset() // reset to initial status isIdle.
 *
 * // State reading as in default ReadonlySignal:
 * $signal.value
 * $signal.peek()
 *
 * // Type-safe state access, for example:
 * if ($signal.value.isError) {
 *  console.log($signal.value.data); // data is undefined
 *  console.error($signal.value.error); // error is Error type
 * }
 */
export const signalAsync = <Data = undefined>() => <Args extends SignalAsyncArgs<Data>>(args?: Args): SignalAsync<Data, Args> => {
  const initialState = {
    isIdle: false,
    isLoading: false,
    isError: false,
    isSuccess: false,
    data: args?.initData as Args['initData'] extends Data ? Data : undefined,
    error: undefined,
  } as const;

  const state = signal<State<Data, Args>>({
    ...initialState,
    isIdle: true,
  }, args?.name);

  return Object.assign(state, {
    loading: () => state.value = {
      ...initialState,
      isLoading: true,
      data: (args?.staleDataOnLoading ? state.peek().data : undefined) as never,
    },
    resolve: (data?: Data) => state.value = {
      ...initialState,
      isSuccess: true,
      data: data as Data,
    },
    reject: (error) => state.value = {
      ...initialState,
      isError: true,
      error,
    },
    reset: () => state.value = {
      ...initialState,
      isIdle: true,
    },
  } satisfies Actions<Data>) as SignalAsync<Data, Args>;
};
