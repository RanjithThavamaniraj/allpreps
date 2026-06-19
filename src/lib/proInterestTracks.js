/** Technology track options for Pro Early Access form */
export const PRO_INTEREST_TRACKS = [
  'Oracle DBA',
  'SQL',
  'Linux',
  'AWS',
  'Azure',
  'GCP',
  'DevOps',
  'Databricks',
  'Snowflake',
  'Kubernetes',
  'Terraform',
];

export const PAYMENT_INTEREST_OPTIONS = ['Yes', 'Maybe', 'No'];

/** Map mock interview track label to early-access dropdown value */
export function trackLabelToProInterest(label) {
  if (!label) return 'Oracle DBA';
  const map = {
    'Google Cloud': 'GCP',
    'Linux Admin': 'Linux',
    'Azure Cloud': 'Azure',
    'AWS Cloud': 'AWS',
    'AWS': 'AWS',
    'Shell Scripting': 'DevOps',
    'Oracle DBA': 'Oracle DBA',
  };
  return map[label] || label;
}
