/** Snowflake content data — merged from parts */
import { item } from './_snowflakeData.part1.mjs';
export { item };

import { TOPIC_DATA as part1 } from './_snowflakeData.part1.mjs';
import { PART2 } from './_snowflakeData.part2.mjs';
import { PART3 } from './_snowflakeData.part3.mjs';
import { PART4_TOPICS, SCENARIO_DATA } from './_snowflakeData.part4.mjs';

export const TOPIC_DATA = {
  ...part1,
  ...PART2,
  ...PART3,
  ...PART4_TOPICS,
};

export { SCENARIO_DATA };
