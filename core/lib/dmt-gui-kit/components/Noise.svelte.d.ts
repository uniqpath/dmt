/** @typedef {typeof __propDef.props}  NoiseProps */
/** @typedef {typeof __propDef.events}  NoiseEvents */
/** @typedef {typeof __propDef.slots}  NoiseSlots */
export default class Noise extends SvelteComponentTyped<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type NoiseProps = typeof __propDef.props;
export type NoiseEvents = typeof __propDef.events;
export type NoiseSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
