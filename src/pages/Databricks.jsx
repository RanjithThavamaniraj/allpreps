import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import { SiDatabricks } from 'react-icons/si';
import TechTrackPage from './TechTrackPage';

export default function Databricks() {
  return (
    <TechTrackPage
      trackId="databricks"
      idPrefix="dbx"
      title="Databricks Track"
      description="Master the Databricks Lakehouse Platform. Prepare for Data Engineer and Platform interviews with questions on Apache Spark, Delta Lake, Unity Catalog, Medallion Architecture, Structured Streaming, cluster management, workflows, and ML integration."
      icon={<SiDatabricks />}
      iconStyle={{ backgroundColor: 'rgba(255, 54, 33, 0.12)', color: '#FF3621' }}
      searchPlaceholder="Filter Databricks questions..."
      emptyTitle="No Databricks questions found matching the criteria"
      stats={[
        { icon: <SiDatabricks />, value: '170 Questions', label: 'Spark & Lakehouse QA' },
        { icon: <FiCpu />, value: 'Delta Lake', label: 'ACID tables, streaming & optimization' },
        { icon: <FiTrendingUp />, value: 'Unity Catalog', label: 'Governance, security & workflows' },
      ]}
    />
  );
}
