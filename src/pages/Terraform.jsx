import { FiLayers, FiTrendingUp } from 'react-icons/fi';
import { SiTerraform } from 'react-icons/si';
import TechTrackPage from './TechTrackPage';

export default function Terraform() {
  return (
    <TechTrackPage
      trackId="terraform"
      idPrefix="tf"
      title="Terraform Track"
      description="Master Infrastructure as Code with Terraform. Prepare for DevOps and Cloud Engineer interviews with questions on providers, resources, state management, remote backends, modules, workspaces, Terraform Cloud, security, and multi-environment deployments."
      icon={<SiTerraform />}
      iconStyle={{ backgroundColor: 'rgba(123, 78, 188, 0.12)', color: '#7B4EBC' }}
      searchPlaceholder="Filter Terraform questions..."
      emptyTitle="No Terraform questions found matching the criteria"
      stats={[
        { icon: <SiTerraform />, value: '170 Questions', label: 'IaC & Terraform QA' },
        { icon: <FiLayers />, value: 'Modules', label: 'Reusable infrastructure patterns' },
        { icon: <FiTrendingUp />, value: 'State & CI/CD', label: 'Remote state, drift & pipelines' },
      ]}
    />
  );
}
