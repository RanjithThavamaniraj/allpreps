import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiDatabase, FiTerminal, FiGitBranch } from 'react-icons/fi';
import { SiGooglecloud } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

const TECH_CARDS = [
  {
    id: 'oracle-dba',
    name: 'Oracle DBA',
    path: '/oracle-dba',
    icon: <FaDatabase />,
    accent: '#ff5722',
    glow: 'rgba(255, 87, 34, 0.4)',
    iconBg: 'rgba(255, 87, 34, 0.15)'
  },
  {
    id: 'linux-admin',
    name: 'Linux Admin',
    path: '/linux-admin',
    icon: <FaLinux />,
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    iconBg: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 'sql',
    name: 'SQL',
    path: '/sql-admin',
    icon: <FiDatabase />,
    accent: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    iconBg: 'rgba(6, 182, 212, 0.15)'
  },
  {
    id: 'aws-cloud',
    name: 'AWS Cloud',
    path: '/aws-cloud',
    icon: <FaAws />,
    accent: '#ff9900',
    glow: 'rgba(255, 153, 0, 0.4)',
    iconBg: 'rgba(255, 153, 0, 0.15)'
  },
  {
    id: 'shell-scripting',
    name: 'Shell Scripting',
    path: '/shell-scripting',
    icon: <FiTerminal />,
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    iconBg: 'rgba(59, 130, 246, 0.15)'
  },
  {
    id: 'devops',
    name: 'DevOps',
    path: '/devops',
    icon: <FiGitBranch />,
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    iconBg: 'rgba(168, 85, 247, 0.15)'
  },
  {
    id: 'azure',
    name: 'Azure Cloud',
    path: '/azure-cloud',
    icon: <VscAzure />,
    accent: '#0078D4',
    glow: 'rgba(0, 120, 212, 0.4)',
    iconBg: 'rgba(0, 120, 212, 0.15)'
  },
  {
    id: 'google',
    name: 'Google Cloud',
    path: '/google-cloud',
    icon: <SiGooglecloud />,
    accent: '#4285F4',
    glow: 'rgba(66, 133, 244, 0.4)',
    iconBg: 'rgba(66, 133, 244, 0.15)'
  }
];

export default function Technologies() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="tech-page-bg">
      <Navbar />

      <style>{`
        .tech-page-bg {
          background-color: #0f172a;
          background-image: 
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.03) 0px, transparent 50%),
            radial-gradient(at 50% 0%, rgba(139, 92, 246, 0.03) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.03) 0px, transparent 50%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .flashy-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
        }

        .flashy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          width: 100%;
        }

        .flashy-card {
          background: rgba(17, 24, 39, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          cursor: pointer;
          text-align: center;
        }

        .flashy-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(255, 255, 255, 0.05), transparent 60%);
          z-index: 1;
          pointer-events: none;
        }

        .flashy-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px -15px var(--glow-color);
          border-color: var(--hover-border);
        }

        .flashy-icon-container {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin-bottom: 24px;
          background: var(--icon-bg);
          color: var(--accent-color);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
          z-index: 2;
        }

        .flashy-card:hover .flashy-icon-container {
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 0 25px var(--glow-color);
        }

        .flashy-card-content {
          position: relative;
          z-index: 2;
        }

        .flashy-card-title {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.015em;
          margin: 0;
          transition: color 0.3s ease;
        }

        .flashy-card:hover .flashy-card-title {
           color: var(--accent-color);
        }
      `}</style>

      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <div className="flashy-container">
          <div className="flashy-grid">
            {TECH_CARDS.map((card) => {
              const isHovered = hoveredCard === card.id;
              const cardStyles = {
                '--glow-color': card.glow,
                '--accent-color': card.accent,
                '--icon-bg': card.iconBg,
                '--hover-border': isHovered ? card.accent : 'rgba(255, 255, 255, 0.06)'
              };

              return (
                <div
                  key={card.id}
                  className="flashy-card"
                  style={cardStyles}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => { window.location.href = card.path; }}
                >
                  <div className="flashy-icon-container">
                    {card.icon}
                  </div>

                  <div className="flashy-card-content">
                    <h2 className="flashy-card-title">{card.name}</h2>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
