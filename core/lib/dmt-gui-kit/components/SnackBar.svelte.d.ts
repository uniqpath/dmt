import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        class?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type SnackBarProps = typeof __propDef.props;
export type SnackBarEvents = typeof __propDef.events;
export type SnackBarSlots = typeof __propDef.slots;
export default class SnackBar extends SvelteComponentTyped<SnackBarProps, SnackBarEvents, SnackBarSlots> {
}
export {};
