import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiDatabase, FiTerminal, FiGitBranch } from 'react-icons/fi';
import { SiGooglecloud } from 'react-icons/si';
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
];

export function getTrackById(id) {
  return READINESS_TRACKS.find(t => t.id === id);
}
