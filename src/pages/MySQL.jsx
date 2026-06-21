import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import { SiMysql } from 'react-icons/si';
import TechTrackPage from './TechTrackPage';
import { MYSQL_LEARNING_PATH } from '../lib/dbTrackMeta';
import { getQuestionsByTech } from '../data/questionLoader';

const questionCount = getQuestionsByTech('mysql').length;

export default function MySQL() {
  return (
    <TechTrackPage
      trackId="mysql"
      idPrefix="mysql"
      title="MySQL Track"
      trackDisplayName="MySQL"
      description="Master MySQL and InnoDB for DBA and backend interviews. Cover storage engines, binary logs, GTID replication, query optimization, indexing, backups with XtraBackup, and high availability with Group Replication."
      icon={<SiMysql />}
      iconStyle={{ backgroundColor: 'rgba(0, 117, 143, 0.12)', color: '#00758F' }}
      searchPlaceholder="Filter MySQL questions..."
      emptyTitle="No MySQL questions found matching the criteria"
      learningPathSteps={MYSQL_LEARNING_PATH}
      showPracticeTests
      stats={[
        { icon: <SiMysql />, value: `${questionCount}+ Questions`, label: 'MySQL Interview QA' },
        { icon: <FiCpu />, value: 'InnoDB', label: 'Buffer pool, locks & transactions' },
        { icon: <FiTrendingUp />, value: 'Replication', label: 'Binlog, GTID & HA clusters' },
      ]}
    />
  );
}
