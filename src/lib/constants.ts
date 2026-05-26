export const SITE_CONFIG = {
  name: 'Faris Maulana',
  title: 'AI Engineer & Researcher',
  tagline: 'Building production AI on national fiber · Multi-agent systems · Smart contract security research',
  email: 'maulanafaris016@gmail.com',
  whatsapp: '+6281284049172',
  whatsappLink: 'https://wa.me/6281284049172',
  linkedin: 'https://www.linkedin.com/in/faris-maulana-0035b914a/',
  github: 'https://github.com/Faris-Maulana',
  location: 'Bogor/Jakarta, Indonesia',
  available: true,
  availableFor: 'Senior AI Engineer · Applied AI Researcher · Consulting',
  responseTime: 'Typically replies within 24h',
} as const

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Research', href: '#research' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
] as const

export const EXPERIENCES = [
  {
    company: 'PT Trans Indonesia Superkoridor',
    role: 'Manager AI Engineering',
    period: 'May 2026 – Present',
    accent: 'cyan',
    bullets: [
      'Building the company\'s Data & AI platform from scratch',
      'Designing Text2SQL Multi-Agent System for fiber-network telemetry over NMS uptime, NOC logs, and billing data',
      'Orchestrating LangGraph agent pipeline with Bronze/Silver/Gold medallion DWH (ClickHouse + PostgreSQL)',
      'PP 71/2019 compliant — fully air-gapped deployment for Indonesian data sovereignty',
      'Integrating vLLM inference serving with custom guardrails layer',
    ],
    stack: ['LangGraph', 'ClickHouse', 'PostgreSQL', 'dbt-core', 'Airflow', 'FastAPI', 'vLLM'],
  },
  {
    company: 'iMerit Technology',
    role: 'Master Consultant AI Engineer',
    period: 'Dec 2025 – Present',
    accent: 'green',
    bullets: [
      'Leading RAG pipeline architecture and evaluation for enterprise clients',
      'Building custom RAGAS-replacement evaluation framework for faithfulness, answer relevance, and context precision',
      'Implementing cross-encoder reranking pipelines and bi-encoder retrieval systems',
      'Advising on LLM safety, guardrails, and red-teaming strategies',
    ],
    stack: ['LangChain', 'ChromaDB', 'sentence-transformers', 'Groq', 'FastAPI', 'Gradio'],
  },
  {
    company: 'PT Berlian Laju Tanker',
    role: 'Data Analyst AI/BI',
    period: 'Dec 2024 – May 2026',
    accent: 'amber',
    bullets: [
      'Fleet-wide business intelligence: built Power BI dashboards across 50+ vessels tracking TCE yield, OPEX variance, and compliance indices',
      'PCA + OLS Regression on 36-month Danaos ERP data — identified compliance as the strongest driver of TCE yield (β=0.612, p<0.001)',
      'Spearheaded AI/BI transformation, integrating predictive models into Danaos ERP workflows',
      '11.2% TCE Yield Lift achieved through data-driven operational recommendations',
    ],
    stack: ['Power BI', 'Oracle SQL', 'Danaos ERP', 'Python', 'PCA', 'OLS'],
  },
  {
    company: 'Toyota Research Institute',
    role: 'Lead Data Scientist',
    period: 'Mar 2024 – Nov 2024',
    accent: 'violet',
    bullets: [
      'Clinical triage optimization: Multiple Linear Regression model reducing intake time by 12.5%',
      'Confusion Matrix cost-benefit analysis balancing TP gains vs FP administrative lag',
      'Built data pipelines processing structured clinical intake data for predictive modeling',
      'Achieved R²=0.81 with Softmax probability floor at 88%',
    ],
    stack: ['Python', 'scikit-learn', 'Regression', 'NLP', 'Biostatistics'],
  },
  {
    company: 'Telkom Indonesia',
    role: 'Data Scientist',
    period: 'Feb 2023 – Nov 2024',
    accent: 'cyan',
    bullets: [
      'B2B predictive churn modeling: Kaplan-Meier Survival + Regularized Logistic Regression',
      '98.5% high-API retention rate, 310% hazard ratio for low-API segment, Pseudo R²=0.79',
      'Built production ETL pipelines on Oracle DB, ClickHouse, and PostgreSQL',
      'Data analytics strategy for Indonesian government connectivity initiatives',
    ],
    stack: ['Python', 'Oracle SQL', 'ClickHouse', 'Survival Analysis', 'Power BI'],
  },
  {
    company: 'Anak Bangsa Bisa (EdTech)',
    role: 'Data Scientist',
    period: 'Sep 2022 – Jan 2023',
    accent: 'muted',
    bullets: [
      'Pedagogical efficacy research: Mixed-Effects Logistic Regression + Decision Tree analysis',
      '3.4× Active Learning Premium identified — sandbox-based learning outperformed passive video 3.4:1',
      '850ms latency breakpoint analysis for optimal platform responsiveness',
      'Research published in Indonesian EdTech journal',
    ],
    stack: ['Python', 'R', 'Mixed-Effects Models', 'scikit-learn'],
  },
  {
    company: 'Freelance / Smart Contract Security',
    role: 'Security Researcher',
    period: '2022 – Present',
    accent: 'muted',
    bullets: [
      'Active auditor on Sherlock, Code4rena, and Immunefi platforms',
      'Reentrancy, access-control, and arithmetic overflow vulnerability discovery in Solidity smart contracts',
      'AI-assisted exploit generation for blockchain security analysis',
      'Published security findings and mitigation strategies',
    ],
    stack: ['Solidity', 'Python', 'Foundry', 'Hardhat'],
  },
] as const

export const SKILLS = [
  {
    category: 'AI & LLM',
    color: 'cyan',
    items: ['LangChain', 'LangGraph', 'RAG Systems', 'RLHF', 'Fine-tuning', 'vLLM', 'SGLang', 'Prompt Engineering', 'Guardrails', 'Groq', 'Claude', 'Llama'],
  },
  {
    category: 'Data Engineering',
    color: 'green',
    items: ['ClickHouse', 'PostgreSQL', 'MySQL', 'dbt-core', 'Airflow', 'Airbyte', 'OpenMetadata', 'MinIO', 'ETL Architecture', 'Medallion DWH'],
  },
  {
    category: 'ML & Research',
    color: 'violet',
    items: ['PyTorch', 'scikit-learn', 'XGBoost', 'sentence-transformers', 'HuggingFace', 'NLP', 'Computer Vision', 'T-bench', 'RAGAS'],
  },
  {
    category: 'Security',
    color: 'red',
    items: ['Smart Contract Auditing', 'Solidity', 'Sherlock', 'Code4rena', 'Immunefi', 'Red-teaming', 'Vulnerability Analysis'],
  },
  {
    category: 'Programming',
    color: 'amber',
    items: ['Python', 'SQL/Oracle', 'JavaScript/TypeScript', 'React/Next.js', 'FastAPI', 'Docker', 'Git', 'Linux'],
  },
  {
    category: 'BI & Analytics',
    color: 'cyan-dim',
    items: ['Power BI', 'Oracle SQL', 'Danaos ERP', 'Advanced Excel', 'Power Query'],
  },
] as const

export const QUANT_CASE_STUDIES = [
  {
    title: 'Maritime Fleet Optimization',
    company: 'PT Berlian Laju Tanker',
    method: 'PCA + OLS Regression',
    metrics: {
      'TCE Yield Lift': '11.2%',
      'OPEX Volatility': '-8.5%',
      'R²': '0.74',
    },
    description: '36-month Danaos ERP data analysis identifying compliance index as the strongest driver of TCE yield. PCA dimensionality reduction followed by OLS regression with robust standard errors.',
    chartType: 'line',
    accent: 'amber',
  },
  {
    title: 'B2B Predictive Churn',
    company: 'Telkom Indonesia',
    method: 'Survival Analysis',
    metrics: {
      'High-API Retention': '98.5%',
      'Hazard Ratio': '310%',
      'Pseudo R²': '0.79',
    },
    description: 'Kaplan-Meier survival curves with regularized logistic regression identifying API usage patterns as the strongest churn predictor across enterprise B2B accounts.',
    chartType: 'survival',
    accent: 'cyan',
  },
  {
    title: 'Clinical Triage Optimization',
    company: 'Toyota Research Institute',
    method: 'Multiple Linear Regression',
    metrics: {
      'Intake Time': '-12.5%',
      'Softmax Floor': '88%',
      'R²': '0.81',
    },
    description: 'MLR model optimizing clinical intake routing with confusion matrix cost-benefit analysis balancing true positive gains against false positive administrative overhead.',
    chartType: 'tradeoff',
    accent: 'violet',
  },
  {
    title: 'Pedagogical Efficacy Study',
    company: 'Anak Bangsa Bisa',
    method: 'Mixed-Effects Logistic Regression',
    metrics: {
      'Active Learning Premium': '3.4×',
      'Latency Breakpoint': '850ms',
      'Lead Time': '14-day',
    },
    description: 'Mixed-effects modeling comparing active sandbox-based learning vs passive video content. Decision tree identified optimal intervention lead time of 14 days.',
    chartType: 'bar',
    accent: 'green',
  },
] as const
