/**
 * Track definitions and question/scenario generator for AllPreps.
 * Run: node scripts/generate-tracks.mjs
 */

import { TOPIC_CONTENT as DATABRICKS_TOPICS, SCENARIO_CONTENT as DATABRICKS_SCENARIOS } from './content/databricksContent.js';
import { TOPIC_CONTENT as SNOWFLAKE_TOPICS, SCENARIO_CONTENT as SNOWFLAKE_SCENARIOS } from './content/snowflakeContent.js';
import { TOPIC_CONTENT as KUBERNETES_TOPICS, SCENARIO_CONTENT as KUBERNETES_SCENARIOS } from './content/kubernetesContent.js';
import { TOPIC_CONTENT as TERRAFORM_TOPICS, SCENARIO_CONTENT as TERRAFORM_SCENARIOS } from './content/terraformContent.js';

export const TRACKS = {
  databricks: {
    id: 'databricks',
    label: 'Databricks',
    path: '/databricks',
    topics: [
      'Databricks Fundamentals', 'Apache Spark Basics', 'DataFrames', 'Delta Lake', 'Delta Tables',
      'Unity Catalog', 'Medallion Architecture', 'ETL Pipelines', 'Structured Streaming', 'Spark Optimization',
      'Cluster Management', 'Security', 'Workflows', 'ML Integration', 'Lakehouse Architecture',
    ],
    topicContent: DATABRICKS_TOPICS,
    scenarioContent: DATABRICKS_SCENARIOS,
  },
  snowflake: {
    id: 'snowflake',
    label: 'Snowflake',
    path: '/snowflake',
    topics: [
      'Snowflake Architecture', 'Virtual Warehouses', 'Databases and Schemas', 'Storage Architecture',
      'Micro Partitions', 'Clustering', 'Query Optimization', 'Security', 'RBAC', 'Streams',
      'Tasks', 'Dynamic Tables', 'Snowpipe', 'Time Travel', 'Fail Safe', 'Zero Copy Clone', 'Data Sharing',
    ],
    topicContent: SNOWFLAKE_TOPICS,
    scenarioContent: SNOWFLAKE_SCENARIOS,
  },
  kubernetes: {
    id: 'kubernetes',
    label: 'Kubernetes',
    path: '/kubernetes',
    topics: [
      'Containers', 'Docker', 'Kubernetes Architecture', 'Pods', 'Deployments', 'ReplicaSets',
      'Services', 'Ingress', 'ConfigMaps', 'Secrets', 'Persistent Volumes', 'Storage Classes',
      'Namespaces', 'RBAC', 'Helm', 'Monitoring', 'Scaling', 'Troubleshooting',
    ],
    topicContent: KUBERNETES_TOPICS,
    scenarioContent: KUBERNETES_SCENARIOS,
  },
  terraform: {
    id: 'terraform',
    label: 'Terraform',
    path: '/terraform',
    topics: [
      'Infrastructure as Code', 'Terraform Basics', 'Providers', 'Resources', 'Variables', 'Outputs',
      'State Files', 'Remote State', 'Modules', 'Workspaces', 'Provisioners', 'Terraform Cloud',
      'Security', 'Multi Environment Deployments', 'Best Practices',
    ],
    topicContent: TERRAFORM_TOPICS,
    scenarioContent: TERRAFORM_SCENARIOS,
  },
};

function topicToSlug(topic) {
  return topic.toLowerCase().replace(/\s+/g, '-');
}

function getTopicItem(track, topic, difficulty, variantIndex) {
  const slug = topicToSlug(topic);
  const pool = track.topicContent[slug]?.[difficulty];
  if (!pool?.length) {
    throw new Error(`Missing content for ${track.id}/${slug}/${difficulty}`);
  }
  return pool[variantIndex % pool.length];
}

function generateQuestionsForTrack(track) {
  const difficulties = ['easy', 'medium', 'hard'];
  const core = [];

  for (const difficulty of difficulties) {
    for (let n = 0; n < 50; n++) {
      const topic = track.topics[n % track.topics.length];
      const variant = Math.floor(n / track.topics.length);
      const tag = topicToSlug(topic);
      const item = getTopicItem(track, topic, difficulty, variant);

    core.push({
        id: `${track.id}-${tag}-${difficulty}-${n + 1}`,
        technology: track.id,
        category: track.id,
        difficulty,
        question: item.q,
        answer: item.a,
        command: item.cmd,
        tags: [track.id, tag, difficulty],
      });
    }
  }

  track.scenarioContent.forEach((scenario, idx) => {
    core.push({
      id: `${track.id}-scenario-${idx + 1}`,
      technology: track.id,
      category: track.id,
      difficulty: scenario.difficulty,
      question: scenario.q || `[Production Scenario] ${scenario.title}: What is your troubleshooting approach?`,
      answer: scenario.a,
      command: scenario.cmd,
      tags: [track.id, 'production-scenario', 'scenario'],
    });
  });

  return core;
}

export function generateAllTracks() {
  const result = {};
  for (const [key, track] of Object.entries(TRACKS)) {
    result[key] = generateQuestionsForTrack(track);
  }
  return result;
}
