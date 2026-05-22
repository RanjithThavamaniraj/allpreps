import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const PREVIEW_QUESTIONS = [
  { id: 1, question: 'How do you identify an archive log gap in Data Guard?', difficulty: 'medium', category: 'Oracle DBA', answer: 'Check V$ARCHIVE_GAP view on the standby database. Query V$MANAGED_STANDBY to see the apply and transport status. Use DGMGRL to show configuration details and identify any log gaps between primary and standby.' },
  { id: 2, question: 'What is the difference between a hard link and a soft link?', difficulty: 'easy', category: 'Linux Admin', answer: 'A soft (symbolic) link points to the file name, and breaking the original file breaks the link. A hard link points to the exact same inode as the original file, so deleting the original file does not delete the hard link as long as one link remains.' },
  { id: 3, question: 'Explain the difference between clustered and non-clustered indexes.', difficulty: 'medium', category: 'SQL', answer: 'A clustered index determines the physical order of data in a table, so there can only be one per table. A non-clustered index creates a separate structure that points to the physical data rows, allowing multiple per table.' },
  { id: 4, question: 'How would you design a highly available web architecture in AWS?', difficulty: 'hard', category: 'AWS', answer: 'Use Route 53 for DNS, an Application Load Balancer across multiple Availability Zones, Auto Scaling Groups for EC2 instances or ECS/EKS containers in private subnets, and Multi-AZ RDS for the database tier.' },
  { id: 5, question: 'Explain the concept of Immutable Infrastructure.', difficulty: 'medium', category: 'DevOps', answer: 'Immutable infrastructure means that servers are never modified after they are deployed. If an update or fix is needed, new servers built from a common image with the appropriate changes are provisioned to replace the old ones.' }
];

export default function QuestionsPreview() {
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="qp-section">
      <div className="container">
        <span className="qp-eyebrow">INTERVIEW QUESTIONS</span>
        <h2 className="qp-title">Popular Technical Questions</h2>

        <div className="qp-list">
          {PREVIEW_QUESTIONS.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`qp-card${isExpanded ? ' qp-card-expanded' : ''}`}
              >
                <button
                  type="button"
                  className="qp-card-header"
                  onClick={() => handleToggle(item.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="qp-card-left">
                    <span className="qp-question-text">{item.question}</span>
                    <span className="qp-category">{item.category}</span>
                  </div>

                  <div className="qp-card-meta">
                    <span className={`badge badge-${item.difficulty}`}>
                      {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                    </span>
                    <span
                      className={`qp-expand-icon${isExpanded ? ' qp-expand-icon-open' : ''}`}
                    >
                      <FiChevronDown />
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="qp-answer">
                    <p className="qp-answer-text">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="qp-cta">
          <a href="/interview-questions">Browse All Questions →</a>
        </div>
      </div>
    </section>
  );
}
