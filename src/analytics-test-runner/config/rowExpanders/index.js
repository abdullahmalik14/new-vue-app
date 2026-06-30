import { expandNewSubscription } from './newSubscription.js';
import { expandRecurringSubscription } from './recurringSubscription.js';
import { expandMerchOrder } from './merchOrder.js';
import { expandCancelSubscription } from './cancelSubscription.js';
import { expandTagEngagement } from './tagEngagement.js';
import { expandFollow } from './follow.js';
import { expandProfileVisit } from './profileVisit.js';
import { expandTokenOrder } from './tokenOrder.js';

/** @type {Record<string, (testCaseKey: string, testCase: object) => import('../../state.js').ExpectedRow[]>} */
export const rowExpanders = {
  newSubscription: expandNewSubscription,
  recurringSubscription: expandRecurringSubscription,
  merchOrder: expandMerchOrder,
  cancelSubscription: expandCancelSubscription,
  tagEngagement: expandTagEngagement,
  follow: expandFollow,
  profileVisit: expandProfileVisit,
  tokenOrder: expandTokenOrder,
};
