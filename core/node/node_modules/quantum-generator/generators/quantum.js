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
import murmurhash from '../lib/murmurhash.js';

function pseudoRandomInt(max, seed) {
  if (seed) {
    // seed as key!
    return murmurhash(seed, '') % max;
  }

  return randomInt(max);
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSentencePattern(topic, { i, seed }) {
  const list = topic ? patterns[topic] : patterns[pseudoRandomInt(patterns.length, seed ? `aaa/${i}/${seed}` : '')];

  return list[pseudoRandomInt(list.length, seed ? `bbb/${i}/${seed}` : '')];
}

function hasTriggerWords(sentence, triggerWord) {
  return sentence.match(new RegExp(`\\b${triggerWord}\\b`));
}

function concretizePattern(patternSentence, { i, seed }) {
  for (const [triggerWord, list] of Object.entries(vocab)) {
    const listClone = JSON.parse(JSON.stringify(list));
    // todo: check if the word was already used so this doesn't happen:
    // 'freedom is the driver of freedom'
    // 'nMass is the driver of nMass' <-- this is the problem, 2x nMass
    let j = 0;
    while (hasTriggerWords(patternSentence, triggerWord)) {
      const index = pseudoRandomInt(listClone.length, seed ? `ccc/${i}/${j}/${seed}` : '');
      const [word] = listClone.splice(index, 1);
      patternSentence = patternSentence.replace(new RegExp(`\\b${triggerWord}\\b`), word);
      j += 1;
    }
  }

  return patternSentence;
}

function generateSentence(topic, { i, seed }) {
  let result = concretizePattern(getSentencePattern(topic, { i, seed }), { i, seed });

  result = capitalizeFirstLetter(result.trim());

  if (result.charAt(result.length - 1) != '?') {
    result += '. ';
  } else {
    result += ' ';
  }

  // remove spaces before commas/periods/semicolons
  return result.replace(/ ([,\.;\?])/g, '$1');
}

function generate({ numSentences = 1, topic, seed } = {}) {
  let fullText = '';

  for (let i = 0; i < numSentences; i++) {
    fullText += generateSentence(topic, { i, seed });
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
