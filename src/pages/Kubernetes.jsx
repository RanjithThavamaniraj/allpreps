import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import { SiKubernetes } from 'react-icons/si';
import TechTrackPage from './TechTrackPage';

export default function Kubernetes() {
  return (
    <TechTrackPage
      trackId="kubernetes"
      idPrefix="k8s"
      title="Kubernetes Track"
      description="Master Kubernetes container orchestration. Prepare for Platform Engineer and SRE interviews with questions on pods, deployments, services, ingress, ConfigMaps, secrets, persistent volumes, RBAC, Helm, monitoring, scaling, and production troubleshooting."
      icon={<SiKubernetes />}
      iconStyle={{ backgroundColor: 'rgba(50, 108, 229, 0.12)', color: '#326CE5' }}
      searchPlaceholder="Filter Kubernetes questions..."
      emptyTitle="No Kubernetes questions found matching the criteria"
      stats={[
        { icon: <SiKubernetes />, value: '170 Questions', label: 'K8s & Container QA' },
        { icon: <FiCpu />, value: 'Workloads', label: 'Pods, deployments & services' },
        { icon: <FiTrendingUp />, value: 'Operations', label: 'Scaling, monitoring & troubleshooting' },
      ]}
    />
  );
}
