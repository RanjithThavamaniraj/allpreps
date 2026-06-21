import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaDatabase, FaLinux, FaAws, FaArrowRight } from 'react-icons/fa';
import { FiTerminal, FiGitBranch, FiChevronRight } from 'react-icons/fi';
import { SiGooglecloud, SiDatabricks, SiSnowflake, SiKubernetes, SiTerraform, SiPostgresql, SiMysql } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

const TECH_CARDS = [
  {
    id: 'snowflake',
    name: 'Snowflake',
    path: '/snowflake',
    icon: <SiSnowflake />,
    accent: '#29B5E8',
    glow: 'rgba(41, 181, 232, 0.4)',
    iconBg: 'rgba(41, 181, 232, 0.1)',
    desc: 'Virtual warehouses, micro-partitions, Snowpipe ingestion, streams and tasks, RBAC, and data sharing.'
  },
  {
    id: 'terraform',
    name: 'Terraform',
    path: '/terraform',
    icon: <SiTerraform />,
    accent: '#7B4EBC',
    glow: 'rgba(123, 78, 188, 0.4)',
    iconBg: 'rgba(123, 78, 188, 0.1)',
    desc: 'Infrastructure as Code, providers, modules, remote state, workspaces, and multi-environment deployments.'
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    path: '/kubernetes',
    icon: <SiKubernetes />,
    accent: '#326CE5',
    glow: 'rgba(50, 108, 229, 0.4)',
    iconBg: 'rgba(50, 108, 229, 0.1)',
    desc: 'Container orchestration, deployments, services, ingress, storage, RBAC, Helm, and cluster troubleshooting.'
  },
  {
    id: 'aws-cloud',
    name: 'AWS Cloud',
    path: '/aws-cloud',
    icon: <FaAws />,
    accent: '#ff9900',
    glow: 'rgba(255, 153, 0, 0.4)',
    iconBg: 'rgba(255, 153, 0, 0.1)',
    desc: 'RDS architectures, EC2 scaling, VPC networking, IAM security, S3 storage solutions, and cloud migrations.'
  },
  {
    id: 'google',
    name: 'Google Cloud',
    path: '/google-cloud',
    icon: <SiGooglecloud />,
    accent: '#4285F4',
    glow: 'rgba(66, 133, 244, 0.4)',
    iconBg: 'rgba(66, 133, 244, 0.1)',
    desc: 'GKE orchestration, Compute Engine, Cloud Spanner, and Google Cloud Load Balancing capabilities.'
  },
  {
    id: 'azure',
    name: 'Azure Cloud',
    path: '/azure-cloud',
    icon: <VscAzure />,
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    iconBg: 'rgba(16, 185, 129, 0.1)',
    desc: 'Azure Virtual Machines, App Services, AKS, Azure SQL, and robust Entra ID security integrations.'
  },
  {
    id: 'oracle-dba',
    name: 'Oracle DBA',
    path: '/oracle-dba',
    icon: <FaDatabase />,
    accent: '#ff5722',
    glow: 'rgba(255, 87, 34, 0.4)',
    iconBg: 'rgba(255, 87, 34, 0.1)',
    desc: 'Core DBA concepts, memory architectures (SGA/PGA), performance tuning, and high-availability configurations.'
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    path: '/postgresql',
    icon: <SiPostgresql />,
    accent: '#336791',
    glow: 'rgba(51, 103, 145, 0.4)',
    iconBg: 'rgba(51, 103, 145, 0.1)',
    desc: 'MVCC, WAL, vacuum, streaming and logical replication, indexing, partitioning, backup/PITR, and Patroni HA.'
  },
  {
    id: 'mysql',
    name: 'MySQL',
    path: '/mysql',
    icon: <SiMysql />,
    accent: '#00758F',
    glow: 'rgba(0, 117, 143, 0.4)',
    iconBg: 'rgba(0, 117, 143, 0.1)',
    desc: 'InnoDB architecture, binary logs, GTID replication, query optimization, XtraBackup, and Group Replication HA.'
  },
  {
    id: 'linux-admin',
    name: 'Linux Admin',
    path: '/linux-admin',
    icon: <FaLinux />,
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    iconBg: 'rgba(16, 185, 129, 0.1)',
    desc: 'Kernel parameters, process scheduling, file systems, LVM disk management, and shell administration.'
  },
  {
    id: 'devops',
    name: 'DevOps',
    path: '/devops',
    icon: <FiGitBranch />,
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    iconBg: 'rgba(168, 85, 247, 0.1)',
    desc: 'CI/CD pipelines, Infrastructure as Code, Docker containerization, and Kubernetes orchestration.'
  },
  {
    id: 'shell-scripting',
    name: 'Shell Scripting',
    path: '/shell-scripting',
    icon: <FiTerminal />,
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    iconBg: 'rgba(59, 130, 246, 0.1)',
    desc: 'Bash scripts, automation logic, backup routines, text processing (sed, awk), and log monitoring.'
  },
  {
    id: 'databricks',
    name: 'Databricks',
    path: '/databricks',
    icon: <SiDatabricks />,
    accent: '#FF3621',
    glow: 'rgba(255, 54, 33, 0.4)',
    iconBg: 'rgba(255, 54, 33, 0.1)',
    desc: 'Lakehouse architecture, Apache Spark, Delta Lake, Unity Catalog, structured streaming, and workflow orchestration.'
  }
];

export default function Technologies() {
  const [activeId, setActiveId] = useState(TECH_CARDS[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeTech = TECH_CARDS.find(t => t.id === activeId) || TECH_CARDS[0];

  return (
    <div className="tech-page-bg">
      <Navbar />

      <style>{`
        .tech-page-bg {
          background-color: #0a0f0d;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .split-layout-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 60px 24px 100px;
          width: 100%;
          display: flex;
          gap: 60px;
          flex-grow: 1;
        }
        
        @media (max-width: 900px) {
          .split-layout-container {
            flex-direction: column;
            gap: 40px;
            padding: 40px 20px 80px;
          }
        }

        /* LEFT SIDE: MASTER LIST */
        .master-list {
          flex: 0 0 320px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        @media (max-width: 900px) {
          .master-list {
            flex: 1;
            width: 100%;
          }
        }

        .list-item {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-radius: 12px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          background: rgba(255, 255, 255, 0.02);
          position: relative;
          overflow: hidden;
        }

        .list-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .list-item.active {
          background: var(--active-bg);
          border-color: var(--active-border);
          box-shadow: 0 4px 20px var(--active-glow);
          transform: translateX(8px);
        }

        @media (max-width: 900px) {
          .list-item.active {
            transform: translateX(0) scale(1.02);
          }
        }

        .list-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--item-icon-bg);
          color: var(--item-accent);
          font-size: 20px;
          margin-right: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        
        .list-item.active .list-icon-wrapper {
           background: var(--item-accent);
           color: #fff;
           box-shadow: 0 0 15px var(--active-glow);
        }

        .list-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          flex-grow: 1;
          transition: all 0.3s ease;
        }

        .list-item:hover .list-title {
          color: rgba(255, 255, 255, 0.85);
        }

        .list-item.active .list-title {
          color: #ffffff;
          font-weight: 700;
        }
        
        .list-chevron {
           color: rgba(255, 255, 255, 0.2);
           transition: all 0.3s ease;
        }
        
        .list-item:hover .list-chevron {
           color: rgba(255, 255, 255, 0.6);
           transform: translateX(4px);
        }
        
        .list-item.active .list-chevron {
           color: var(--item-accent);
           transform: translateX(4px);
        }

        /* RIGHT SIDE: DETAIL STAGE */
        .detail-stage {
          flex: 1;
          background: rgba(13, 18, 16, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
        }
        
        @media (max-width: 900px) {
          .detail-stage {
            padding: 40px 24px;
            min-height: 400px;
          }
        }

        .detail-glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--stage-glow) 0%, transparent 70%);
          opacity: 0.15;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
          transition: all 0.6s ease;
        }

        .detail-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 500px;
          animation: fadeScaleIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        @keyframes fadeScaleIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .stage-icon-hero {
          font-size: 80px;
          color: var(--stage-accent);
          margin-bottom: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 160px;
          height: 160px;
          background: var(--stage-icon-bg);
          border-radius: 40px;
          box-shadow: 0 20px 50px var(--stage-glow), inset 0 2px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
        }

        .stage-title {
          font-size: 42px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }
        
        @media (max-width: 900px) {
          .stage-title { font-size: 32px; }
        }

        .stage-desc {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0 0 40px 0;
        }

        .btn-enter-track {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: var(--stage-accent);
          border-radius: 9999px;
          text-decoration: none;
          box-shadow: 0 8px 25px var(--stage-glow);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-enter-track:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px var(--stage-glow);
          filter: brightness(1.1);
        }
        
        .btn-enter-track svg {
          margin-left: 8px;
          transition: transform 0.3s ease;
        }
        
        .btn-enter-track:hover svg {
          transform: translateX(4px);
        }
      `}</style>

      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '20px' }}>
           <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#fff', marginBottom: '16px', letterSpacing: '-0.025em' }}>Explore Technologies</h1>
           <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
              Master the infrastructure, tooling, and systems that power the modern web. Choose a learning track to begin.
           </p>
        </div>

        <div className="split-layout-container">
          
          {/* Master List (Left) */}
          <div className="master-list">
            {TECH_CARDS.map(card => {
              const isActive = activeId === card.id;
              return (
                <div 
                  key={card.id}
                  className={`list-item ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => { if (!isMobile) setActiveId(card.id); }}
                  onClick={() => {
                    setActiveId(card.id);
                    if (isMobile) {
                      document.getElementById('detail-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  style={{
                    '--item-accent': card.accent,
                    '--item-icon-bg': card.iconBg,
                    '--active-bg': `${card.accent}15`,
                    '--active-border': `${card.accent}50`,
                    '--active-glow': `${card.accent}30`
                  }}
                >
                  <div className="list-icon-wrapper">
                    {card.icon}
                  </div>
                  <h3 className="list-title">{card.name}</h3>
                  <FiChevronRight size={20} className="list-chevron" />
                </div>
              );
            })}
          </div>

          {/* Detail Stage (Right) */}
          <div className="detail-stage" id="detail-stage" style={{
             '--stage-accent': activeTech.accent,
             '--stage-glow': activeTech.glow,
             '--stage-icon-bg': activeTech.iconBg
          }}>
            <div className="detail-glow-bg"></div>
            
            <div className="detail-content" key={activeTech.id}>
              <div className="stage-icon-hero">
                {activeTech.icon}
              </div>
              <h2 className="stage-title">{activeTech.name}</h2>
              <p className="stage-desc">{activeTech.desc}</p>
              
              <a href={activeTech.path} className="btn-enter-track">
                Enter Track <FaArrowRight size={16} />
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
