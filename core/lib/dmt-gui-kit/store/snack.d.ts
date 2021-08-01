export type SnackOpts = {
    color?: 'normal' | 'danger';
    timeout?: number;
};
export declare const snackbar: {
    subscribe: (this: void, run: import("svelte/store").Subscriber<{
        message: string;
        color: SnackOpts['color'];
    } | null>, invalidate?: ((value?: {
        message: string;
        color: SnackOpts['color'];
    } | null | undefined) => void) | undefined) => import("svelte/store").Unsubscriber;
    show: (value: string, { color, timeout }?: SnackOpts) => void;
    close: () => void;
};
