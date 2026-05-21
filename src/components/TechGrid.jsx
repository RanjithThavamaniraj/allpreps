import { useMemo } from 'react';
import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiDatabase, FiTerminal, FiGitBranch, FiArrowRight } from 'react-icons/fi';
import { SiGooglecloud } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import { QUESTIONS_DATA } from '../data/questionsData';

const TRACKS_METADATA = [
  {
    id: 'oracle dba',
    name: 'Oracle DBA',
    path: '/oracle-dba',
    icon: <FaDatabase />,
    desc: 'Core DBA concepts, memory architectures (SGA/PGA), performance tuning, and high-availability configurations.',
  },
  {
    id: 'linux',
    name: 'Linux Admin',
    path: '/linux-admin',
    icon: <FaLinux />,
    desc: 'Kernel parameters, process scheduling, file systems, LVM disk management, and shell administration.',
  },
  {
    id: 'sql',
    name: 'SQL',
    path: '/sql-admin',
    icon: <FiDatabase />,
    desc: 'Advanced relational operations, execution plans, index optimization, normalisation, and analytic queries.',
  },
  {
    id: 'aws',
    name: 'AWS Cloud',
    path: '/aws-cloud',
    icon: <FaAws />,
    desc: 'RDS architectures, EC2 scaling, VPC networking, IAM security, S3 storage solutions, and cloud migrations.',
  },
  {
    id: 'shell scripting',
    name: 'Shell Scripting',
    path: '/shell-scripting',
    icon: <FiTerminal />,
    desc: 'Bash scripts, automation logic, backup routines, text processing (sed, awk), and log monitoring.',
  },
  {
    id: 'devops',
    name: 'DevOps',
    path: '/devops',
    icon: <FiGitBranch />,
    desc: 'CI/CD pipelines, Infrastructure as Code, Docker containerization, and Kubernetes orchestration.',
  },
  {
    id: 'azure',
    name: 'Azure Cloud',
    path: '/azure-cloud',
    icon: <VscAzure />,
    desc: 'Azure Virtual Machines, App Services, AKS, Azure SQL, and robust Entra ID security integrations.',
  },
  {
    id: 'google',
    name: 'Google Cloud',
    path: '/google-cloud',
    icon: <SiGooglecloud />,
    desc: 'GKE orchestration, Compute Engine, Cloud Spanner, and Google Cloud Load Balancing capabilities.',
  },
];

export default function TechGrid() {
  const tracks = useMemo(() => {
    return TRACKS_METADATA.map(track => {
      const questionsCount = QUESTIONS_DATA.filter(q => q.category === track.id).length;
      return {
        ...track,
        count: `${questionsCount} Questions`,
      };
    });
  }, []);

  return (
    <section className="tech" id="topics" style={{ padding: '60px 0' }}>
      <div className="container">
        <div className="section-header fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">Learning Tracks</span>
          <h2 className="section-title">Choose Your Specialisation</h2>
          <p className="section-sub" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Select a learning track below to explore real-world scenario questions and solutions.
          </p>
        </div>

        <div className="grid-3">
          {tracks.map(t => (
            <div
              className="card"
              key={t.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '28px',
                height: '100%',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className="tech-panel-icon" style={{ margin: 0 }}>
                  {t.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {t.name}
                  </h3>
                  <span
                    className="badge badge-primary"
                    style={{
                      fontSize: '11px',
                      marginTop: '4px',
                      display: 'inline-block',
                      backgroundColor: 'rgba(37,99,235,0.15)',
                      color: 'var(--primary-hover)',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      fontWeight: '600',
                    }}
                  >
                    {t.count}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  marginBottom: '28px',
                  flexGrow: 1,
                }}
              >
                {t.desc}
              </p>

              <div style={{ marginTop: 'auto' }}>
                <a href={t.path} className="btn btn-primary" style={{ width: '100%' }}>
                  Open Track <FiArrowRight size={14} style={{ marginLeft: '4px' }} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
