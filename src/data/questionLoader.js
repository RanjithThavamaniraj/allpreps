import { QUESTIONS_DATA as legacyData } from './questionsData';

// Vite feature: dynamically and eagerly import all .js files in subdirectories
const modules = import.meta.glob('./*/*.js', { eager: true });

let newQuestions = [];

// Iterate through the loaded modules and aggregate the exported `questions` arrays
for (const path in modules) {
  const mod = modules[path];
  if (mod && mod.questions && Array.isArray(mod.questions)) {
    newQuestions = newQuestions.concat(mod.questions);
  }
}

// Map the legacy monolithic data to match the new schema so the UI doesn't break
// during the data migration phase.
const mappedLegacy = legacyData.map(q => ({
  id: `legacy-${q.id}`,
  technology: q.category.replace(' dba', '').replace(' cloud', '').trim(), // Normalize e.g., 'oracle dba' -> 'oracle'
  category: q.category, // Keep original category for backwards compatibility
  difficulty: q.difficulty,
  question: q.title,
  answer: q.answer,
  command: q.command,
  tags: [q.category]
}));

// Combine new architecture questions with the legacy fallback
export const ALL_QUESTIONS = [...newQuestions, ...mappedLegacy];

/**
 * Reusable search architecture APIs
 */

export const getQuestionsByTech = (techKey) => {
  const normalizedTech = techKey.toLowerCase();
  return ALL_QUESTIONS.filter(q => {
    const qTech = (q.technology || '').toLowerCase();
    const qCat = (q.category || '').toLowerCase();
    
    return qTech === normalizedTech || qCat === normalizedTech || qCat.includes(normalizedTech);
  });
};

export const searchQuestions = (query, filters = {}) => {
  let results = ALL_QUESTIONS;
  
  if (query) {
    let qL = query.toLowerCase();
    
    // Semantic AI Search Enhancement Mappings
    const semanticMap = {
      'archive gap': ['dataguard', 'standby', 'transport', 'fal', 'archive logs'],
      'oom': ['memory', 'killer', 'swap', 'linux', 'out of memory'],
      'slow': ['performance', 'tuning', 'explain plan', 'index', 'wait event'],
      'high availability': ['rac', 'dataguard', 'cluster', 'multi-az'],
      'delta lake': ['databricks', 'delta', 'lakehouse', 'bronze', 'silver', 'gold', 'unity catalog'],
      'spark': ['databricks', 'dataframe', 'structured streaming', 'cluster'],
      'snowflake': ['warehouse', 'virtual warehouse', 'micro partition', 'snowpipe', 'time travel'],
      'crashloop': ['kubernetes', 'pod', 'container', 'restart', 'liveness'],
      'ingress': ['kubernetes', 'service', 'tls', 'load balancer'],
      'terraform state': ['terraform', 'drift', 'backend', 'remote state', 'lock'],
      'iac': ['terraform', 'module', 'provider', 'provisioner'],
    };

    // Expand search query with semantic keywords if a map matches
    let searchTerms = [qL];
    for (const [key, relatedTerms] of Object.entries(semanticMap)) {
      if (qL.includes(key)) {
        searchTerms = searchTerms.concat(relatedTerms);
      }
    }

    results = results.filter(q => {
      const qText = (q.question || '').toLowerCase();
      const aText = (q.answer || '').toLowerCase();
      const tagsText = (q.tags || []).join(' ').toLowerCase();
      
      // Match if ANY of the expanded search terms are found
      return searchTerms.some(term => 
        qText.includes(term) || aText.includes(term) || tagsText.includes(term)
      );
    });
  }
  
  if (filters.technology && filters.technology !== 'all') {
    results = results.filter(q => q.technology === filters.technology || q.category === filters.technology);
  }
  
  if (filters.difficulty && filters.difficulty !== 'all') {
    results = results.filter(q => q.difficulty === filters.difficulty);
  }
  
  return results;
};

export const getQuestionById = (id) => {
  return ALL_QUESTIONS.find(q => q.id === id);
};
