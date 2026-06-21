import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import { SiPostgresql } from 'react-icons/si';
import TechTrackPage from './TechTrackPage';
import { POSTGRESQL_LEARNING_PATH } from '../lib/dbTrackMeta';
import { getQuestionsByTech } from '../data/questionLoader';

const questionCount = getQuestionsByTech('postgresql').length;

export default function PostgreSQL() {
  return (
    <TechTrackPage
      trackId="postgresql"
      idPrefix="pg"
      title="PostgreSQL Track"
      trackDisplayName="PostgreSQL"
      description="Master PostgreSQL for DBA and backend engineering interviews. Cover MVCC, WAL, VACUUM, autovacuum, streaming and logical replication, index types, partitioning, backup/PITR, and high availability with Patroni."
      icon={<SiPostgresql />}
      iconStyle={{ backgroundColor: 'rgba(51, 103, 145, 0.12)', color: '#336791' }}
      searchPlaceholder="Filter PostgreSQL questions..."
      emptyTitle="No PostgreSQL questions found matching the criteria"
      learningPathSteps={POSTGRESQL_LEARNING_PATH}
      showPracticeTests
      stats={[
        { icon: <SiPostgresql />, value: `${questionCount}+ Questions`, label: 'PostgreSQL Interview QA' },
        { icon: <FiCpu />, value: 'MVCC & WAL', label: 'Concurrency, vacuum & durability' },
        { icon: <FiTrendingUp />, value: 'Replication', label: 'Streaming, logical & HA failover' },
      ]}
    />
  );
}
