import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiDatabase, FiTerminal, FiGitBranch, FiArrowRight } from 'react-icons/fi';
import { SiGooglecloud, SiDatabricks, SiSnowflake, SiKubernetes, SiTerraform } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

const TRACKS = [
  {
    name: 'Oracle DBA',
    path: '/oracle-dba',
    icon: <FaDatabase />,
    topics: 'Data Guard • RMAN • RAC',
    count: '1200+',
  },
  {
    name: 'Linux Admin',
    path: '/linux-admin',
    icon: <FaLinux />,
    topics: 'Shell • Monitoring • Services',
    count: '900+',
  },
  {
    name: 'SQL',
    path: '/sql-admin',
    icon: <FiDatabase />,
    topics: 'Joins • Performance • Indexing',
    count: '800+',
  },
  {
    name: 'AWS',
    path: '/aws-cloud',
    icon: <FaAws />,
    topics: 'EC2 • IAM • S3',
    count: '1000+',
  },
  {
    name: 'DevOps',
    path: '/devops',
    icon: <FiGitBranch />,
    topics: 'CI/CD • Docker • Kubernetes',
    count: '700+',
  },
  {
    name: 'Google Cloud',
    path: '/google-cloud',
    icon: <SiGooglecloud />,
    topics: 'Compute • IAM • Networking',
    count: '600+',
  },
  {
    name: 'Azure',
    path: '/azure-cloud',
    icon: <VscAzure />,
    topics: 'Identity • Networking • Storage',
    count: '600+',
  },
  {
    name: 'Shell Scripting',
    path: '/shell-scripting',
    icon: <FiTerminal />,
    topics: 'Automation • Cron • Bash',
    count: '500+',
  },
  {
    name: 'Databricks',
    path: '/databricks',
    icon: <SiDatabricks />,
    topics: 'Spark • Delta Lake • Unity Catalog',
    count: '170+',
  },
  {
    name: 'Snowflake',
    path: '/snowflake',
    icon: <SiSnowflake />,
    topics: 'Warehouses • Snowpipe • Time Travel',
    count: '170+',
  },
  {
    name: 'Kubernetes',
    path: '/kubernetes',
    icon: <SiKubernetes />,
    topics: 'Pods • Services • Helm',
    count: '170+',
  },
  {
    name: 'Terraform',
    path: '/terraform',
    icon: <SiTerraform />,
    topics: 'IaC • Modules • Remote State',
    count: '170+',
  },
];

export default function TechGrid() {
  return (
    <section className="tg-section" id="topics">
      <div className="container">
        <div className="tg-header">
          <span className="tg-eyebrow">Technologies</span>
          <h2 className="tg-title">Technology Tracks</h2>
        </div>
        <div className="tg-grid">
          {TRACKS.map((t) => (
            <a key={t.name} href={t.path} className="tg-card">
              <div className="tg-card-icon">{t.icon}</div>
              <div className="tg-card-body">
                <h3 className="tg-card-name">{t.name}</h3>
                <p className="tg-card-topics">{t.topics}</p>
              </div>
              <div className="tg-card-footer">
                <span className="tg-card-count">{t.count} Questions</span>
                <FiArrowRight className="tg-card-arrow" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
