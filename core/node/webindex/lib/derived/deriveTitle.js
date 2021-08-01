export default function deriveTitle(entry) {
  const { context, urlmetadata, manualTitle } = entry;

  let title = manualTitle || urlmetadata?.title?.trim() || '';

  if (context.toLowerCase().startsWith(title.toLowerCase())) {
    title = context;
    delete entry.context;
  }

  if (title.toLowerCase().startsWith(context.toLowerCase())) {
    delete entry.context;
  }

  if (title) {
    entry.title = title;
  }
}
