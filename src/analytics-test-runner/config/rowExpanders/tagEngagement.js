import { addTrendingTagsApiRow } from './helpers.js';

export function expandTagEngagement(testCaseKey, testCase) {
  const tagId = testCase.fields?.tagId ?? 'Panty_Fetish';
  const rows = [];
  addTrendingTagsApiRow(rows, testCaseKey, tagId, 1);
  return rows;
}
