/** Chip slugs used in ?chip= query param → question category ids */
export const CHIP_TO_CATEGORY = {
  oracle: 'oracle dba',
  postgresql: 'postgresql',
  mysql: 'mysql',
  linux: 'linux',
  aws: 'aws',
  devops: 'devops',
  azure: 'azure',
  google: 'google',
  shell: 'shell scripting',
  databricks: 'databricks',
  snowflake: 'snowflake',
  kubernetes: 'kubernetes',
  terraform: 'terraform',
};

export function getRouteKey() {
  return window.location.pathname + window.location.search;
}

export function scrollToHash(hash, retries = 12) {
  if (!hash) return;
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  const attemptScroll = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (retries > 0) {
      setTimeout(() => scrollToHash(`#${id}`, retries - 1), 80);
    }
  };
  attemptScroll();
}

export function parseInterviewQuestionsSearch(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    q: params.get('q') || '',
    chip: params.get('chip') || '',
    filter: params.get('filter') || '',
    productionOnly: params.get('filter') === 'production-scenarios',
  };
}
