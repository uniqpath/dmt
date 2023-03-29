export default function priorityArray(a, b = undefined) {
  const _b = (!b && b !== 0) || Array.isArray(b) ? b : [b];
  const _a = (!a && a !== 0) || Array.isArray(a) ? a : [a];

  if (Object.is(_a, null) || Object.is(_a, false)) {
    return [];
  }

  return _a || _b || [];
}
