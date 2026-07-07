import { AsyncLocalStorage } from 'node:async_hooks';
/**
 * Store options, with options closer to the current position
 * appearing earlier in the array
 */
const optionStorage = new AsyncLocalStorage();
/**
 * Get the current options
 * @returns options
 */
export function getOptions() {
    return optionStorage.getStore() ?? [];
}
/**
 * Run a function with some new options
 * @param options options to run with
 * @param callback what you want to do
 * @returns the result of the function
 */
export function addOptions(options, callback) {
    return optionStorage.run([...options, ...getOptions()], callback);
}
/**
 * Simulate assigning values to `isTTY`
 * Only effective in the current asynchronous context
 * @param isTTY now value of `isTTY`
 * @param name what stream you need to assign
 */
export function enterIsTTY(isTTY, name) {
    optionStorage.enterWith([{ isTTY: { [name]: isTTY } }, ...getOptions()]);
}
