'use strict'

function negotiate (header, supportedEncodings) {
  if (!header) {
    return undefined
  }
  const supportedEncodingMap = createMap(supportedEncodings)
  const acceptedEncodings = parse(header)
    .sort((a, b) => comparator(a, b, supportedEncodingMap))
    .filter(isNonZeroQuality)
  return determinePreffered(acceptedEncodings, supportedEncodingMap)
}

function determinePreffered (acceptedEncodings, supportedEncodings) {
  for (const encoding of acceptedEncodings) {
    const selected = supportedEncodings[encoding.name]
    if (selected) {
      return selected.encoding
    }
  }
  return null
}

function createMap (supported) {
  const supportedEncodings = {}
  let priority = 0
  if (supported.length > 0) {
    supportedEncodings['*'] = { encoding: supported[0], priority }
    priority++
  }
  for (const encoding of supported) {
    supportedEncodings[encoding] = { encoding, priority }
    priority++
  }
  return supportedEncodings
}

function parse (header) {
  const split = header.split(',')
  return split.map(parseEncoding)
}

function isNonZeroQuality (encoding) {
  return encoding.quality !== 0
}

function parseEncoding (encoding) {
  const [name, second] = encoding.trim().split(';')
  const quality = getQuality(second)
  return {
    name,
    quality
  }
}

function getQuality (second) {
  if (!second) {
    return 1
  }
  const [, quality] = second.trim().split('=')
  return parseFloat(quality)
}

function comparator (a, b, supportedEncodingMap) {
  if (a.quality === b.quality) {
    if (supportedEncodingMap[a.name] &&
      supportedEncodingMap[b.name] &&
      supportedEncodingMap[a.name].priority < supportedEncodingMap[b.name].priority) {
      return -1
    } else {
      return 1
    }
  }
  return b.quality - a.quality
}

module.exports = {
  negotiate
}
