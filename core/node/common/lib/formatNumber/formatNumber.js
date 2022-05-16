import exactMath from 'exact-math';

function addCommas(num, opts) {
  if (opts.separator === false) {
    return num.toString();
  }

  if (num < 1000) {
    return num.toString();
  }

  const separator = typeof opts.separator === 'string' ? opts.separator : ',';

  const out = [];
  const digits = Math.round(num)
    .toString()
    .split('');

  digits.reverse().forEach((digit, i) => {
    if (i && i % 3 === 0) {
      out.push(separator);
    }
    out.push(digit);
  });

  return out.reverse().join('');
}

function roundDecimals(value, decimals = 2) {
  if (decimals == 0) {
    return Math.round(value);
  }

  return exactMath.round(value, -1 * decimals);
}

function formatDec(num, base, { decimal, precision, round }) {
  const workingNum = num / base;
  const ROUND = round ? roundDecimals : Math.floor;
  if (decimal === false) {
    num = ROUND(workingNum);
    return num.toString();
  }

  if (precision) {
    num = workingNum;
  } else {
    num = workingNum < 10 ? ROUND(workingNum) : ROUND(workingNum, 1);
  }

  num = num.toString();
  if (typeof decimal === 'string') {
    num = num.replace('.', decimal);
  }

  return num;
}

const THOUSAND = 1000;
const TEN_THOUSAND = 10000;
const MILLION = 1000000;
const BILLION = 1000000000;
const TRILLION = 1000000000000;

function approximateBigNumber(num, opts) {
  let numString;
  opts = opts || {};

  if (opts.round == undefined) {
    opts.round = true;
  }

  const negative = num < 0;
  if (negative) {
    num = Math.abs(num);
  }

  if (opts.precision) {
    num = parseFloat(num.toPrecision(opts.precision));
  }

  const thousandsBreak = opts.min10k ? TEN_THOUSAND : THOUSAND;

  if (num < thousandsBreak) {
    numString = addCommas(formatDec(num, 1, opts), opts);
  } else if (opts.precision && opts.precision > Math.log10(num)) {
    numString = addCommas(formatDec(num, 1, opts), opts);
  } else if (num < MILLION) {
    numString = `${formatDec(num, THOUSAND, opts)}k`;
  } else if (num < BILLION) {
    numString = `${formatDec(num, MILLION, opts)}m`;
  } else if (num < TRILLION) {
    numString = `${addCommas(formatDec(num, BILLION, opts), opts)}b`;
  } else {
    numString = `${addCommas(formatDec(num, TRILLION, opts), opts)}t`;
  }

  if (negative) {
    numString = `-${numString}`;
  }

  if (opts.capital) {
    numString = numString.toUpperCase();
  }

  if (opts.prefix) {
    numString = opts.prefix + numString;
  }
  if (opts.suffix) {
    numString = `${numString}${opts.suffix}`;
  }

  return numString;
}

approximateBigNumber.addCommas = addCommas;

function approx(val, { lowPrecision = false } = {}) {
  if (Math.abs(val) >= 10000) {
    return approximateBigNumber(val);
  }

  let dec = 2;

  const decimalPart = Math.abs(val - Math.trunc(val));

  if (decimalPart == 0) {
    dec = 0;
  } else if (decimalPart < 0.0001) {
    dec = 12;
  } else if (decimalPart < 0.001) {
    dec = 10;
  } else if (decimalPart < 0.01) {
    dec = 8;
  } else if (decimalPart < 0.1) {
    dec = 6;
  } else if (decimalPart < 1) {
    dec = 4;
  }

  dec = Math.max(0, lowPrecision ? Math.min(2, dec - 2) : dec);

  const result = roundDecimals(val, dec);

  return parseFloat(result.toFixed(dec));
}

export { approx, roundDecimals as round };
