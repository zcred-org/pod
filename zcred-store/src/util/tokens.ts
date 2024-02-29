import type { AppContext } from '../app.js';

export const tokens = <T extends (keyof AppContext)[]>(...keys: T) => keys;
