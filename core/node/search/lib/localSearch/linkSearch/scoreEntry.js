import { searchPredicate } from 'dmt/search';

import scoreUrl from './scorers/scoreUrl';
import scoreUrlDomain from './scorers/scoreUrlDomain';
import scoreBySelectedTags from './scorers/scoreBySelectedTags';

function scoreForAppearance(text = '', { terms, score } = {}) {
  return score * searchPredicate(text, terms);
}

function explainScore(scoreExplain, comment, score) {
  if (!score) {
    return scoreExplain;
  }

  return `${scoreExplain ? `${scoreExplain} + ` : ''}${comment} ${score}`;
}

function assignScore({ entry, terms }) {
  let score = 0;

  const { url, title, tags, context, boost } = entry;

  const strTags = tags ? tags.join(' ') : '';

  const str = `${url || ''} ${title || ''} ${context || ''} ${strTags || ''} `;

  let scoreExplain = '';

  if (searchPredicate(str, terms)) {
    score = 10;
    scoreExplain = explainScore(scoreExplain, 'base', score);

    if (boost) {
      score += boost;
      scoreExplain = explainScore(scoreExplain, 'boost', boost);
    }

    const _urlScore = Math.max(1, scoreUrl(url, { terms }));
    score += _urlScore;
    scoreExplain = explainScore(scoreExplain, 'url', _urlScore);

    const _domainScore = scoreUrlDomain(url);
    score += _domainScore;
    scoreExplain = explainScore(scoreExplain, 'domain', _domainScore);

    const _titleScore = scoreForAppearance(title, { terms, score: 10 });
    score += _titleScore;
    scoreExplain = explainScore(scoreExplain, 'title', _titleScore);

    const _tagsScore = scoreForAppearance(strTags, { terms, score: 1000 });
    score += _tagsScore;
    scoreExplain = explainScore(scoreExplain, 'tags', _tagsScore);

    const _contextScore = scoreForAppearance(context, { terms, score: 3 });
    score += _contextScore;
    scoreExplain = explainScore(scoreExplain, 'context', _contextScore);
  }

  return { score, scoreExplain };
}

export default function scoreEntry({ entry, terms, selectedTags }) {
  let { score: queryScore, scoreExplain } = assignScore({ entry, terms });

  let _scoreBySelectedTags;

  if (queryScore) {
    _scoreBySelectedTags = scoreBySelectedTags({ entry, selectedTags });
    queryScore += _scoreBySelectedTags;
    scoreExplain = explainScore(scoreExplain, 'scoreBySelectedTags', _scoreBySelectedTags);
  }

  let score = queryScore;
  if (selectedTags?.length) {
    const allTerms = [...new Set(terms.concat(selectedTags || []))];
    const { score: _totalScore, scoreExplain: _explainTotalScore } = assignScore({ entry, terms: allTerms });

    score = _totalScore;
    scoreExplain = _explainTotalScore;

    if (score) {
      score += _scoreBySelectedTags;
      scoreExplain = explainScore(scoreExplain, 'scoreBySelectedTags', _scoreBySelectedTags);
    }
  }

  return { ...entry, ...{ score, queryScore, scoreExplain } };
}
