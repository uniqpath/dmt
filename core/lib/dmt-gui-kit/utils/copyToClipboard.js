import { snackbar } from '../store/snack';
export const copyToClipboard = async (text, successMessage) => {
  const message = successMessage || 'Text copied to clipboard.';
  let textToCopy = text;
  if (!textToCopy) {
    snackbar.show('Nothing to copy.', { color: 'danger', timeout: 1500 });
    return false;
  }
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      snackbar.show(message, { timeout: 3000 });
      return true;
    } catch (error) {}
  }
  try {
    const input = document.createElement('textarea');
    input.innerHTML = textToCopy;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    snackbar.show(message, { timeout: 3000 });
    return true;
  } catch (error) {
    snackbar.show('Could not copy to clipboard.', { color: 'danger', timeout: 1500 });
    return false;
  }
};
