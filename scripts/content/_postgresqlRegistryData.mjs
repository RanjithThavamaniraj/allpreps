/** Merge all PostgreSQL registry question data parts */
import { PART1 } from './_postgresqlRegistryData.part1.mjs';
import { PART2 } from './_postgresqlRegistryData.part2.mjs';
import { PART3 } from './_postgresqlRegistryData.part3.mjs';
import { PART4 } from './_postgresqlRegistryData.part4.mjs';
import { PART5 } from './_postgresqlRegistryData.part5.mjs';

export const ALL_TOPICS = [
  ...PART1,
  ...PART2,
  ...PART3,
  ...PART4,
  ...PART5,
];
