export default function splitTime(time) {
  let [h, m] = time.split(':');

  m = m || 0;

  if (
    m
      .toString()
      .toLowerCase()
      .endsWith('pm') ||
    h
      .toString()
      .toLowerCase()
      .endsWith('pm')
  ) {
    h = parseInt(
      h
        .toString()
        .toLowerCase()
        .replace('pm', '')
    );
    m = parseInt(
      m
        .toString()
        .toLowerCase()
        .replace('pm', '')
    );

    if (h > 0 && h < 12) {
      h = parseInt(h) + 12;
    }
  }

  h = parseInt(
    h
      .toString()
      .toLowerCase()
      .replace('am', '')
  );
  m = parseInt(
    m
      .toString()
      .toLowerCase()
      .replace('am', '')
  );

  return { h, m };
}
