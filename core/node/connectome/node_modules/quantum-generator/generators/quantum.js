/*
 * main.js
 *
 * New Age Bullshit Generator
 * © 2014 Seb Pearce (sebpearce.com)
 * Licensed under the MIT License.
 *
 */

import vocab from './vocab/vocab.js';
import patterns from './vocab/patterns.js';
import topics from './vocab/topics.js';

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSentencePattern(topic) {
  //return patterns[patterns.length];

  const list = topic ? patterns[topic] : patterns[randomInt(patterns.length)];

  return list[randomInt(list.length)];
}

function concretizePattern(patternSentence) {
  for (const [triggerWord, list] of Object.entries(vocab)) {
    patternSentence = patternSentence.replace(new RegExp(`\\b${triggerWord}\\b`, 'g'), list[randomInt(list.length)]);
  }

  return patternSentence;
}

function generateSentence(topic) {
  let result = concretizePattern(getSentencePattern(topic));

  result = capitalizeFirstLetter(result.trim());

  if (result.charAt(result.length - 1) != '?') {
    result += '. ';
  } else {
    result += ' ';
  }

  // remove spaces before commas/periods/semicolons
  return result.replace(/ ([,\.;\?])/g, '$1');
}

function generate({ numSentences = 1, topic } = {}) {
  let fullText = '';

  for (let i = 0; i < numSentences; i++) {
    fullText += generateSentence(topic);
  }

  // replace 'a [vowel]' with 'an [vowel]'
  // I added a \W before the [Aa] because one time I got
  // "Dogman is the antithesis of knowledge" :)
  fullText = fullText.replace(/(^|\W)([Aa]) ([aeiou])/g, '$1$2n $3');

  // take care of prefixes (delete the space after the hyphen)
  fullText = fullText.replace(/- /g, '-');

  return fullText.trim();
}

generate.topics = topics;

export default generate;

