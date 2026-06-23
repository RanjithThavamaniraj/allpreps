import { useState, useEffect } from 'react';
import {
  AppIcon,
  Brain,
  BookOpen,
  Zap,
  MessageSquare,
  Layers,
  CheckCircle,
  Play,
  RefreshCw,
} from './icons';

export default function AIGuidancePanel({ question, tags }) {
  const [activeFeature, setActiveFeature] = useState('explain'); // 'explain', 'scenario', 'mock', 'deepdive'
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mockContent, setMockContent] = useState('');
  const [userMockAnswer, setUserMockAnswer] = useState('');
  const [mockFeedback, setMockFeedback] = useState(null);

  // Simulate AI generation delay
  const simulateGeneration = (contentGenerator, ms = 1500) => {
    setIsGenerating(true);
    setMockContent('');
    setTimeout(() => {
      setMockContent(contentGenerator());
      setIsGenerating(false);
    }, ms);
  };

  // Mock Generators

  const getExplainContent = (level, q) => {
    const tagStr = (tags || []).join(' ').toLowerCase();
    const isPostgres = tagStr.includes('postgresql') || tagStr.includes('postgres');
    const isMysql = tagStr.includes('mysql') || tagStr.includes('innodb');

    if (isPostgres) {
      if (level === 'Beginner') return `PostgreSQL fundamentals for "${q}": focus on process architecture, MVCC visibility, and how queries map to EXPLAIN output. Mention pg_stat_* views for monitoring.`;
      if (level === 'Intermediate') return `Intermediate PostgreSQL answer for "${q}": cover WAL durability, autovacuum/bloat, index choice (B-tree vs GIN), and replication lag metrics from pg_stat_replication.`;
      if (level === 'Senior Engineer') return `Senior PostgreSQL depth on "${q}": discuss lock modes, isolation anomalies, checkpoint tuning, partition pruning, and HA failover with Patroni/repmgr trade-offs.`;
      return `Production PostgreSQL incident for "${q}": prioritize pg_stat_activity, lock waits, replication slot lag, and disk usage on pg_wal before schema changes.`;
    }

    if (isMysql) {
      if (level === 'Beginner') return `MySQL fundamentals for "${q}": explain InnoDB vs MyISAM, connection/thread model, and basic SHOW commands (PROCESSLIST, ENGINE INNODB STATUS).`;
      if (level === 'Intermediate') return `Intermediate MySQL answer for "${q}": reference binary logs, ROW vs STATEMENT replication, EXPLAIN output, and slow query log analysis.`;
      if (level === 'Senior Engineer') return `Senior MySQL depth on "${q}": cover GTID failover, buffer pool sizing, metadata locks, Group Replication quorum, and backup/restore with XtraBackup.`;
      return `Production MySQL incident for "${q}": check SHOW REPLICA STATUS, InnoDB lock waits, disk on binlog volume, and connection limits before killing threads.`;
    }

    if (level === 'Beginner') return `Let's break this down simply: Imagine ${q} is like organizing a library. Instead of looking through every book, we use an index card (the index) to find exactly what we need quickly.`;
    if (level === 'Intermediate') return `At an intermediate level, understanding ${q} involves recognizing how the database engine optimizes the execution plan to reduce disk I/O.`;
    if (level === 'Senior Engineer') return `For a senior role, you must articulate the internal locking mechanisms, buffer cache impacts, and how ${q} behaves under extreme high-concurrency workloads.`;
    return `In a Production Support scenario for ${q}, your priority is restoring service. You would immediately check alert logs, wait events, and determine if an emergency hot-fix or rollback is required.`;
  };

  const getScenarioContent = (q) => {
    return `Critical Alert at 2 AM:\n\n"The standby database has stopped applying archive logs, and the primary mount point is filling up rapidly due to ${q}."\n\nWhat are your immediate first 3 troubleshooting steps before calling the lead engineer?`;
  };

  const getDeepDiveContent = (tagList) => {
    const tagStr = (tagList || []).join(' ').toLowerCase();
    if (tagStr.includes('postgresql') || tagStr.includes('postgres')) {
      return `PostgreSQL Deep Dive Map:\n\n1. Process & Memory Architecture\n2. MVCC, WAL & Checkpointing\n3. Vacuum, Bloat & Autovacuum\n4. Index Types & Partitioning\n5. Streaming & Logical Replication\n6. Backup, PITR & HA Failover`;
    }
    if (tagStr.includes('mysql')) {
      return `MySQL Deep Dive Map:\n\n1. InnoDB Storage Engine\n2. Binary Logs & GTID Replication\n3. Indexing & Query Optimization\n4. Buffer Pool & I/O Tuning\n5. Backup (XtraBackup) & PITR\n6. Group Replication & HA Failover`;
    }
    return `Deep Dive Map for [${tagList.join(', ')}]:\n\n1. Core Architecture Layer\n2. Background Processes\n3. Memory Structures\n4. Common Wait Events\n5. Production Tuning Best Practices`;
  };

  
  useEffect(() => {
    // Generate initial content when feature or difficulty changes
    if (activeFeature === 'explain') {
      // eslint-disable-next-line
      simulateGeneration(() => getExplainContent(difficultyLevel, question));
    } else if (activeFeature === 'scenario') {
      // eslint-disable-next-line
      simulateGeneration(() => getScenarioContent(question));
    } else if (activeFeature === 'deepdive') {
      // eslint-disable-next-line
      simulateGeneration(() => getDeepDiveContent(tags));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFeature, difficultyLevel, question]);

  const handleEvaluateMock = () => {
    if (!userMockAnswer.trim()) return;
    setIsGenerating(true);
    setMockFeedback(null);
    setTimeout(() => {
      setMockFeedback({
        strong: ["Good initial approach to the problem.", "Used correct terminology."],
        missing: ["Did not mention checking the diagnostic logs.", "Forgot to mention the impact on active sessions."],
        suggestions: ["Always state how you would minimize downtime first.", "Include the specific view you would query (e.g., v$session)."]
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="ai-guidance-panel">
      <div className="ai-header">
        <AppIcon icon={Brain} size="lg" className="ai-icon-pulse" />
        <span className="ai-title">AI Interview Guide</span>
      </div>

      <div className="ai-feature-tabs">
        <button className={activeFeature === 'explain' ? 'active' : ''} onClick={() => setActiveFeature('explain')}><AppIcon icon={BookOpen} size="sm" /> Explain</button>
        <button className={activeFeature === 'scenario' ? 'active' : ''} onClick={() => setActiveFeature('scenario')}><AppIcon icon={Zap} size="sm" /> Scenario</button>
        <button className={activeFeature === 'mock' ? 'active' : ''} onClick={() => setActiveFeature('mock')}><AppIcon icon={MessageSquare} size="sm" /> Mock</button>
        <button className={activeFeature === 'deepdive' ? 'active' : ''} onClick={() => setActiveFeature('deepdive')}><AppIcon icon={Layers} size="sm" /> Deep Dive</button>
      </div>

      <div className="ai-content-area">
        {activeFeature === 'explain' && (
          <div className="ai-section">
            <div className="ai-pill-nav">
              {['Beginner', 'Intermediate', 'Senior Engineer', 'Production Support'].map(lvl => (
                <button key={lvl} className={`ai-pill ${difficultyLevel === lvl ? 'active' : ''}`} onClick={() => setDifficultyLevel(lvl)}>
                  {lvl}
                </button>
              ))}
            </div>
            <div className="ai-response-box">
              {isGenerating ? <div className="shimmer-text">Generating AI explanation...</div> : <p>{mockContent}</p>}
            </div>
            
            {!isGenerating && (
              <div className="ai-followups">
                <h4><AppIcon icon={RefreshCw} size="sm" style={{ marginRight: '6px' }} /> Interviewer Follow-ups</h4>
                <ul>
                  <li>"What happens if this component completely fails?"</li>
                  <li>"How would you monitor this using standard views?"</li>
                  <li>"Explain a time you had to troubleshoot this in production."</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {activeFeature === 'scenario' && (
          <div className="ai-section">
             <div className="ai-response-box scenario-box">
              {isGenerating ? <div className="shimmer-text">Building production scenario...</div> : <p style={{whiteSpace: 'pre-wrap'}}>{mockContent}</p>}
            </div>
          </div>
        )}

        {activeFeature === 'deepdive' && (
          <div className="ai-section">
             <div className="ai-response-box">
              {isGenerating ? <div className="shimmer-text">Analyzing technical depth...</div> : <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0}}>{mockContent}</pre>}
            </div>
            {!isGenerating && (
              <div className="ai-related">
                <h4>Related Topics</h4>
                <div className="ai-pill-nav">
                  <span className="ai-pill">Performance Tuning</span>
                  <span className="ai-pill">High Availability</span>
                  <span className="ai-pill">Disaster Recovery</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeFeature === 'mock' && (
          <div className="ai-section">
            <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px'}}>
              <strong>Mock Question:</strong> Briefly explain how you would approach answering the main question in a live technical interview.
            </p>
            <textarea 
              className="ai-textarea input-field"
              placeholder="Type your answer here..."
              value={userMockAnswer}
              onChange={(e) => setUserMockAnswer(e.target.value)}
              rows={4}
            />
            <button className="btn btn-primary btn-sm" style={{width: '100%', marginTop: '12px'}} onClick={handleEvaluateMock} disabled={isGenerating || !userMockAnswer.trim()}>
              {isGenerating ? 'Evaluating Response...' : <><AppIcon icon={Play} size="sm" /> Evaluate My Answer</>}
            </button>

            {mockFeedback && !isGenerating && (
              <div className="ai-evaluation fade-up">
                <div className="eval-group strong">
                  <h5><AppIcon icon={CheckCircle} size="sm" /> Strong Points</h5>
                  <ul>{mockFeedback.strong.map((s,i)=><li key={i}>{s}</li>)}</ul>
                </div>
                <div className="eval-group missing">
                  <h5><AppIcon icon={Zap} size="sm" /> Missing Points</h5>
                  <ul>{mockFeedback.missing.map((s,i)=><li key={i}>{s}</li>)}</ul>
                </div>
                <div className="eval-group suggestions">
                  <h5><AppIcon icon={MessageSquare} size="sm" /> Suggestions</h5>
                  <ul>{mockFeedback.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
