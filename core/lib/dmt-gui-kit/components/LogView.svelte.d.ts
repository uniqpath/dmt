/** @typedef {typeof __propDef.props}  LogViewProps */
/** @typedef {typeof __propDef.events}  LogViewEvents */
/** @typedef {typeof __propDef.slots}  LogViewSlots */
export default class LogView extends SvelteComponentTyped<{
    title: any;
    showLogInitially?: boolean | undefined;
    limit?: number | undefined;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type LogViewProps = typeof __propDef.props;
export type LogViewEvents = typeof __propDef.events;
export type LogViewSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        title: any;
        showLogInitially?: boolean | undefined;
        limit?: number | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
