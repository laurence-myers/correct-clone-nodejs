/**
 * @param {T} object - The object to clone.
 * @returns {T}
 */
declare function fastDeepClone<T>(object : T) : T;

declare module 'fast-deepclone' {
    export = fastDeepClone;
}