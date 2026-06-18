import { ALL_QUESTIONS } from '../data/questionLoader';

/** Existing AI Guide entry point — Interview Questions practice section */
export const PRODUCTION_SCENARIOS_URL = '/interview-questions#practice';

export const PRODUCTION_SCENARIO_TRACKS = {
  'oracle dba': { label: 'Oracle DBA', chip: 'oracle' },
  linux: { label: 'Linux Admin', chip: 'linux' },
  sql: { label: 'SQL', chip: 'sql' },
  aws: { label: 'AWS', chip: 'aws' },
  devops: { label: 'DevOps', chip: 'devops' },
  azure: { label: 'Azure', chip: 'azure' },
  google: { label: 'Google Cloud', chip: 'google' },
  'shell scripting': { label: 'Shell Scripting', chip: 'shell' },
};

export function getScenarioCountForTrack(trackId) {
  return ALL_QUESTIONS.filter(q => q.category === trackId).length;
}

export function getTotalScenarioCount() {
  return ALL_QUESTIONS.length;
}

export function getTechnologyCountWithScenarios() {
  return Object.keys(PRODUCTION_SCENARIO_TRACKS).filter(
    id => getScenarioCountForTrack(id) > 0
  ).length;
}

export function getProductionScenariosUrl(chip) {
  if (chip) {
    return `/interview-questions?chip=${encodeURIComponent(chip)}#practice`;
  }
  return PRODUCTION_SCENARIOS_URL;
}

export function hasProductionScenarios(trackId) {
  return getScenarioCountForTrack(trackId) > 0;
}
