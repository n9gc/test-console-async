/**
 * Manager of `AsyncLocalStorage`
 * @license MIT
 * @author n9gc
 */
declare module './index.ts';

import { AsyncLocalStorage } from 'node:async_hooks';
import type { InspectOption } from './types.ts';

/**
 * Store options, with options closer to the current position
 * appearing earlier in the array
 */
const optionStorage = new AsyncLocalStorage<readonly InspectOption[]>();

/**
 * Get the current options
 * @returns options
 */
export function getOptions(): readonly InspectOption[] {
	return optionStorage.getStore() ?? [];
}

/**
 * Run a function with some new options
 * @param options options to run with
 * @param callback what you want to do
 * @returns the result of the function
 */
export function addOptions<T>(options: readonly InspectOption[], callback: () => T) {
	return optionStorage.run([...options, ...getOptions()], callback);
}

