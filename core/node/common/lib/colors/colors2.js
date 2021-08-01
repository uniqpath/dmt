import _invertColor from 'invert-color';

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex({ r, g, b }) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function HSVtoHSL({ h, s, v }) {
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  var _h = h,
    _s = s * v,
    _l = (2 - s) * v;
  _s /= _l <= 1 ? _l : 2 - _l;
  _l /= 2;

  return {
    h: _h,
    s: _s,
    l: _l
  };
}

function HSLtoHSV({ h, s, l }) {
  var _h = h,
    _s,
    _v;

  l *= 2;
  s *= l <= 1 ? l : 2 - l;
  _v = (l + s) / 2;
  _s = (2 * s) / (l + s);

  return {
    h: _h,
    s: _s,
    v: _v
  };
}

function HSVtoRGB({ h, s, v }) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function mapTemperatureToHSL(temp) {
  const percent = 50 - temp;
  const h = Math.round((270 * percent) / 100.0 + (temp < -10 ? 65 : temp > 20 ? 35 : 60));
  const s = 1;
  const l = 0.5;

  return { h: h / 360, s, l };
}

function mapTemperatureToRGB(temp) {
  return rgbToHex(HSVtoRGB(HSLtoHSV(mapTemperatureToHSL(temp))));
}

function invertColor(color) {
  return _invertColor(color, true);
}

export default { mapTemperatureToRGB, mapTemperatureToHSL, invertColor };
