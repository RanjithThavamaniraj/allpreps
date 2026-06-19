import { FiDatabase, FiTrendingUp } from 'react-icons/fi';
import { SiSnowflake } from 'react-icons/si';
import TechTrackPage from './TechTrackPage';

export default function Snowflake() {
  return (
    <TechTrackPage
      trackId="snowflake"
      idPrefix="sf"
      title="Snowflake Track"
      description="Master Snowflake Data Cloud. Prepare for analytics and data engineering interviews with questions on virtual warehouses, micro-partitions, clustering, Snowpipe, streams and tasks, dynamic tables, time travel, RBAC, and zero-copy clone."
      icon={<SiSnowflake />}
      iconStyle={{ backgroundColor: 'rgba(41, 181, 232, 0.12)', color: '#29B5E8' }}
      searchPlaceholder="Filter Snowflake questions..."
      emptyTitle="No Snowflake questions found matching the criteria"
      stats={[
        { icon: <SiSnowflake />, value: '170 Questions', label: 'Data Cloud & SQL QA' },
        { icon: <FiDatabase />, value: 'Warehouses', label: 'Compute, scaling & cost control' },
        { icon: <FiTrendingUp />, value: 'Pipelines', label: 'Snowpipe, streams, tasks & sharing' },
      ]}
    />
  );
}
