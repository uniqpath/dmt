/** @typedef {typeof __propDef.props}  XIconProps */
/** @typedef {typeof __propDef.events}  XIconEvents */
/** @typedef {typeof __propDef.slots}  XIconSlots */
export default class XIcon extends SvelteComponentTyped<{
    size?: string | undefined;
    strokeWidth?: number | undefined;
    class?: string | undefined;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type XIconProps = typeof __propDef.props;
export type XIconEvents = typeof __propDef.events;
export type XIconSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        size?: string | undefined;
        strokeWidth?: number | undefined;
        class?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
