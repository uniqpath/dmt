/**
 *
 * @param text Text to copy.
 * @param successMessage message to be displayed on snackbar, when it is successful. Defaults to "Text copied to clipboard."
 * @returns `true` if copy is successful else `false`.
 *
 */
export declare const copyToClipboard: (text: string, successMessage?: string) => Promise<boolean>;
