export default function validateTime(time, tag = '') {
  if (!/^\d?\d(:\d\d)?(am|pm)?$/i.test(time)) {
    throw new Error(`notifier "${tag}" wrong time format: ${time}`);
  }
}
