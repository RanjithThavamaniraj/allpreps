import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiDatabase, FiTerminal, FiGitBranch } from 'react-icons/fi';
import { SiGooglecloud, SiDatabricks, SiSnowflake, SiKubernetes, SiTerraform } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

export const READINESS_TRACKS = [
  { id: 'oracle dba', name: 'Oracle DBA', icon: FaDatabase, path: '/oracle-dba' },
  { id: 'linux', name: 'Linux Admin', icon: FaLinux, path: '/linux-admin' },
  { id: 'sql', name: 'SQL', icon: FiDatabase, path: '/sql-admin' },
  { id: 'aws', name: 'AWS Cloud', icon: FaAws, path: '/aws-cloud' },
  { id: 'azure', name: 'Azure Cloud', icon: VscAzure, path: '/azure-cloud' },
  { id: 'google', name: 'Google Cloud', icon: SiGooglecloud, path: '/google-cloud' },
  { id: 'shell scripting', name: 'Shell Scripting', icon: FiTerminal, path: '/shell-scripting' },
  { id: 'devops', name: 'DevOps', icon: FiGitBranch, path: '/devops' },
  { id: 'databricks', name: 'Databricks', icon: SiDatabricks, path: '/databricks' },
  { id: 'snowflake', name: 'Snowflake', icon: SiSnowflake, path: '/snowflake' },
  { id: 'kubernetes', name: 'Kubernetes', icon: SiKubernetes, path: '/kubernetes' },
  { id: 'terraform', name: 'Terraform', icon: SiTerraform, path: '/terraform' },
];

export function getTrackById(id) {
  return READINESS_TRACKS.find(t => t.id === id);
}
