// @ts-ignore: No types for @ungap/structured-clone
import structuredClone from '@ungap/structured-clone';
if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = structuredClone;
}
if (typeof global.structuredClone !== 'function') {
    global.structuredClone = structuredClone;
}
export { default } from "expo-router";
