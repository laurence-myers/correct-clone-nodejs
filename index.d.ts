/**
 * @param {T} object - The object to clone.
 * @returns {T}
 */
declare function correctCloneNodejs<T>(object : T) : T;

declare module 'correct-clone-nodejs' {
    export = correctCloneNodejs;
}