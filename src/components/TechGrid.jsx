import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiTerminal, FiGitBranch, FiArrowRight } from 'react-icons/fi';
import { SiGooglecloud, SiDatabricks, SiSnowflake, SiKubernetes, SiTerraform, SiPostgresql, SiMysql } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

const TRACKS = [
  { name: 'Oracle DBA', path: '/oracle-dba', icon: <FaDatabase />, topics: ['Data Guard', 'RMAN', 'RAC'], count: '1200+', group: 'databases' },
  { name: 'PostgreSQL', path: '/postgresql', icon: <SiPostgresql />, topics: ['MVCC', 'Replication', 'Performance'], count: '100+', group: 'databases' },
  { name: 'MySQL', path: '/mysql', icon: <SiMysql />, topics: ['InnoDB', 'Replication', 'Indexing'], count: '100+', group: 'databases' },
  { name: 'Linux Admin', path: '/linux-admin', icon: <FaLinux />, topics: ['Shell', 'Monitoring', 'Services'], count: '900+', group: 'cloud' },
  { name: 'AWS', path: '/aws-cloud', icon: <FaAws />, topics: ['EC2', 'IAM', 'S3'], count: '1000+', group: 'cloud' },
  { name: 'Azure', path: '/azure-cloud', icon: <VscAzure />, topics: ['Identity', 'Networking', 'Storage'], count: '600+', group: 'cloud' },
  { name: 'Google Cloud', path: '/google-cloud', icon: <SiGooglecloud />, topics: ['Compute', 'IAM', 'Networking'], count: '600+', group: 'cloud' },
  { name: 'DevOps', path: '/devops', icon: <FiGitBranch />, topics: ['CI/CD', 'Docker', 'Kubernetes'], count: '700+', group: 'cloud' },
  { name: 'Shell Scripting', path: '/shell-scripting', icon: <FiTerminal />, topics: ['Automation', 'Cron', 'Bash'], count: '500+', group: 'cloud' },
  { name: 'Kubernetes', path: '/kubernetes', icon: <SiKubernetes />, topics: ['Pods', 'Services', 'Helm'], count: '170+', group: 'platform' },
  { name: 'Terraform', path: '/terraform', icon: <SiTerraform />, topics: ['IaC', 'Modules', 'Remote State'], count: '170+', group: 'platform' },
  { name: 'Snowflake', path: '/snowflake', icon: <SiSnowflake />, topics: ['Warehouses', 'Snowpipe', 'Time Travel'], count: '170+', group: 'platform' },
  { name: 'Databricks', path: '/databricks', icon: <SiDatabricks />, topics: ['Spark', 'Delta Lake', 'Unity Catalog'], count: '170+', group: 'platform' },
];

const DOMAINS = [
  {
    id: 'databases',
    label: 'Database Technologies',
    description: 'Engine internals, HA, backup, and production tuning',
    accent: '#f97316',
  },
  {
    id: 'cloud',
    label: 'Cloud & Infrastructure',
    description: 'Linux, cloud platforms, DevOps, and automation',
    accent: '#3b82f6',
  },
  {
    id: 'platform',
    label: 'Data & Platform Engineering',
    description: 'Lakehouse, warehousing, orchestration, and IaC',
    accent: '#29B5E8',
  },
];

export default function TechGrid() {
  return (
    <section className="tg-section" id="topics">
      <div className="container">
        <div className="tg-header">
          <div className="tg-header-copy">
            <span className="tg-eyebrow">Technologies</span>
            <h2 className="tg-title">Technology Tracks</h2>
            <p className="tg-subtitle">
              {TRACKS.length} tracks with structured Q&amp;A, production scenarios, and interview-ready depth.
            </p>
          </div>
          <div className="tg-header-meta">
            <div className="tg-stat">
              <span className="tg-stat-value">{TRACKS.length}</span>
              <span className="tg-stat-label">Tracks</span>
            </div>
            <div className="tg-stat-divider" aria-hidden="true" />
            <div className="tg-stat">
              <span className="tg-stat-value">6200+</span>
              <span className="tg-stat-label">Questions</span>
            </div>
            <a href="/technologies" className="tg-explore-link">
              Full explorer <FiArrowRight size={14} />
            </a>
          </div>
        </div>

        <div className="tg-panels tg-panels-trio">
          {DOMAINS.map(domain => {
            const tracks = TRACKS.filter(t => t.group === domain.id);
            return (
              <article
                key={domain.id}
                className="tg-panel"
                style={{ '--tg-accent': domain.accent }}
              >
                <header className="tg-panel-head">
                  <h3 className="tg-panel-title">{domain.label}</h3>
                  <p className="tg-panel-desc">{domain.description}</p>
                </header>

                <div className="tg-panel-tracks">
                  {tracks.map(track => (
                    <a key={track.name} href={track.path} className="tg-track">
                      <span className="tg-track-icon" aria-hidden="true">{track.icon}</span>
                      <span className="tg-track-body">
                        <span className="tg-track-top">
                          <span className="tg-track-name">{track.name}</span>
                          <span className="tg-track-count">{track.count}</span>
                        </span>
                        <span className="tg-track-tags">
                          {track.topics.map(topic => (
                            <span key={topic} className="tg-track-tag">{topic}</span>
                          ))}
                        </span>
                      </span>
                      <FiArrowRight className="tg-track-arrow" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
