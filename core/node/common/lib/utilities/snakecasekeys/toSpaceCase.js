import clean from './toNoCase';

export default toSpaceCase;

function toSpaceCase(string) {
  return clean(string)
    .replace(/[\W_]+(.|$)/g, (matches, match) => {
      return match ? ` ${match}` : '';
    })
    .trim();
}
