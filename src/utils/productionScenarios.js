import { ALL_QUESTIONS } from '../data/questionLoader';

/** Production scenario question bank entry point */
export const PRODUCTION_SCENARIOS_URL = '/interview-questions?filter=production-scenarios#practice';

export const PRODUCTION_SCENARIO_TRACKS = {
  'oracle dba': { label: 'Oracle DBA', chip: 'oracle' },
  postgresql: { label: 'PostgreSQL', chip: 'postgresql' },
  mysql: { label: 'MySQL', chip: 'mysql' },
  linux: { label: 'Linux Admin', chip: 'linux' },
  aws: { label: 'AWS', chip: 'aws' },
  devops: { label: 'DevOps', chip: 'devops' },
  azure: { label: 'Azure', chip: 'azure' },
  google: { label: 'Google Cloud', chip: 'google' },
  'shell scripting': { label: 'Shell Scripting', chip: 'shell' },
  databricks: { label: 'Databricks', chip: 'databricks' },
  snowflake: { label: 'Snowflake', chip: 'snowflake' },
  kubernetes: { label: 'Kubernetes', chip: 'kubernetes' },
  terraform: { label: 'Terraform', chip: 'terraform' },
};

export function isProductionScenarioQuestion(q) {
  return (q.tags || []).includes('production-scenario');
}

export function getScenarioCountForTrack(trackId) {
  return ALL_QUESTIONS.filter(
    q => q.category === trackId && isProductionScenarioQuestion(q)
  ).length;
}

export function getTotalScenarioCount() {
  return ALL_QUESTIONS.filter(isProductionScenarioQuestion).length;
}

export function getTechnologyCountWithScenarios() {
  return Object.keys(PRODUCTION_SCENARIO_TRACKS).filter(
    id => getScenarioCountForTrack(id) > 0
  ).length;
}

export function getProductionScenariosUrl(chip) {
  if (chip) {
    return `/interview-questions?filter=production-scenarios&chip=${encodeURIComponent(chip)}#practice`;
  }
  return PRODUCTION_SCENARIOS_URL;
}

export function hasProductionScenarios(trackId) {
  return getScenarioCountForTrack(trackId) > 0;
}
