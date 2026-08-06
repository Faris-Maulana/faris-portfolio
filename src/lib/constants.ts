export const SITE_CONFIG = {
  name: 'Faris Maulana',
  role: 'Manager, AI Engineering',
  company: 'PT Trans Indonesia Superkoridor',
  title: 'AI Engineering Manager. LLM Systems and Multi-Agent Architecture',
  tagline:
    'I build production AI on national fiber infrastructure. Multi-agent systems, medallion data platforms, and the evaluation harnesses that keep them honest.',
  email: 'maulanafaris016@gmail.com',
  whatsapp: '+6281284049172',
  whatsappLink: 'https://wa.me/6281284049172',
  linkedin: 'https://www.linkedin.com/in/faris-maulana-0035b914a/',
  github: 'https://github.com/Faris-Maulana',
  location: 'Bogor / Jakarta, Indonesia',
  timezone: 'GMT+7',
  available: true,
  availableFor: 'Senior AI Engineering, Applied AI Research, and Consulting',
  responseTime: 'Replies within 24 hours',

  /* Served from /public. No database dependency, no expiring signed URL. */
  cvPath: '/cv/Faris_Maulana_CV.pdf',
  portfolioPath: '/cv/Faris_Maulana_Portfolio.pdf',
  quantPath: '/cv/Faris_Maulana_Quantitative_Portfolio.pdf',
} as const

export const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Research', href: '#research' },
  { label: 'Credentials', href: '#certificates' },
  { label: 'Writing', href: '#blog' },
  { label: 'Contact', href: '#contact' },
] as const

/** The four numbers that carry the hero. Each one is defensible from the CV. */
export const HERO_METRICS = [
  { value: '25,000', unit: 'km', label: 'Fiber backbone operated' },
  { value: '5', unit: '+ yrs', label: 'Production AI and data' },
  { value: '20', unit: '+', label: 'BI dashboards shipped' },
  { value: '5', unit: '', label: 'Industries delivered in' },
] as const

export const LEDGER = [
  'PT Trans Indonesia Superkoridor',
  'iMerit Technology',
  'Telkom Indonesia',
  'Toyota Research Institute',
  'PT Berlian Laju Tanker',
  'Sherlock',
  'Code4rena',
  'Immunefi',
  'Anak Bangsa Bisa',
] as const

export const EXPERIENCES = [
  {
    company: 'PT Trans Indonesia Superkoridor',
    role: 'Manager, AI Engineering',
    period: 'May 2026 to present',
    status: 'active',
    accent: 'signal',
    summary:
      'Founding AI Engineering hire at a neutral 25,000 km DWDM fiber backbone operator. I own the function, the platform, and the agent layer.',
    bullets: [
      'Built the AI Engineering function from zero, covering hiring, architecture, and delivery',
      'Designed a medallion platform on ClickHouse and PostgreSQL with dbt-core, Airflow, Airbyte, and OpenMetadata',
      'Architecting a LangGraph multi-agent Text2SQL system over NMS uptime, NOC logs, and billing data. Schema discovery, planning, generation, validation, and synthesis each run as a separate agent',
      'Evaluated on-prem LLM serving with vLLM and SGLang across Apple Silicon and Ubuntu. PP 71/2019 requires full air-gap, so no third-party cloud is in the path',
      'Present architecture and platform progress directly to the founder and IT leadership',
    ],
    stack: ['LangGraph', 'ClickHouse', 'PostgreSQL', 'dbt-core', 'Airflow', 'Airbyte', 'vLLM', 'FastAPI'],
  },
  {
    company: 'iMerit Technology',
    role: 'Master Consultant, AI Engineer',
    period: 'Dec 2025 to present',
    status: 'active',
    accent: 'agent',
    summary:
      'I lead end-to-end LLM engagements for enterprise clients in the US, from problem definition through compliant production deployment.',
    bullets: [
      'Own the full engagement: problem definition, dataset strategy, evaluation, fine-tuning, and deployment against client SLAs',
      'Design task-specific fine-tuning pipelines with domain-labeled data, RLHF, and red-teaming for high-risk use cases',
      'Built a RAGAS replacement that scores faithfulness, answer relevance, and retrieval diversity without ground-truth API calls',
      'Advise on RAG patterns, vector database selection, guardrail design, and AI governance to move clients from proof of concept into compliant production',
    ],
    stack: ['LangChain', 'ChromaDB', 'sentence-transformers', 'cross-encoders', 'Groq', 'RLHF'],
  },
  {
    company: 'PT Berlian Laju Tanker Tbk',
    role: 'Data Analyst, AI and BI',
    period: 'Dec 2024 to May 2026',
    status: 'completed',
    accent: 'cred',
    summary:
      'Fleet-wide business intelligence across 15+ tankers and gas carriers, plus the analysis that changed how the fleet was operated.',
    bullets: [
      'Built and maintained 20+ Power BI dashboards across Technical, Safety, Operations, Commercial, Finance, and subsidiaries',
      'Engineered SQL and Oracle queries across Danaos ERP, B-Path, and B-One into one reporting layer, cutting manual report prep by roughly half',
      'PCA and OLS regression on 36 months of Danaos data found compliance index to be the strongest driver of TCE yield at β=0.612, p<0.001',
      'Shipped a crew Performance Assessment app on React, Node.js, and MySQL with role-based access and a parallel state-machine workflow, verified with Playwright end to end',
      'Directed annual technical budgeting for 11 vessels and prepared audit-ready reconciliations',
    ],
    stack: ['Power BI', 'Oracle SQL', 'Danaos ERP', 'Python', 'PCA', 'React', 'Playwright'],
  },
  {
    company: 'Toyota Research Institute',
    role: 'Lead Data Scientist',
    period: 'Mar 2024 to Nov 2024',
    status: 'completed',
    accent: 'agent',
    summary:
      'Applied machine learning to healthcare and automotive research problems under HIPAA-equivalent compliance.',
    bullets: [
      'Applied regression, decision trees, and clustering with Python and PyTorch to clinical and automotive research data',
      'Cut clinical intake time by 12.5% with a multiple linear regression triage model at R²=0.81',
      'Ran confusion-matrix cost-benefit analysis to balance true-positive gain against false-positive administrative load',
      'Translated high-dimensional findings into recommendations that research and business teams could act on',
    ],
    stack: ['Python', 'PyTorch', 'scikit-learn', 'Biostatistics'],
  },
  {
    company: 'Telkom Indonesia',
    role: 'Data Scientist',
    period: 'Feb 2023 to Nov 2024',
    status: 'completed',
    accent: 'data',
    summary:
      'Defined and executed the AI product roadmap for the largest telecommunications operator in Indonesia.',
    bullets: [
      'Owned the AI product roadmap aligned with Telkom Strategic Insights initiatives',
      'Delivered NLP for text and speech plus computer vision projects into production behind REST APIs',
      'Modelled B2B churn with Kaplan-Meier survival analysis and regularized logistic regression, reaching 98.5% retention on high-API accounts at pseudo R²=0.79',
      'Built production ETL on Oracle, ClickHouse, and PostgreSQL, and wrote the business cases for new AI initiatives',
    ],
    stack: ['Python', 'Oracle SQL', 'ClickHouse', 'Survival Analysis', 'NLP', 'Computer Vision'],
  },
  {
    company: 'Independent, Web3 Security',
    role: 'Smart Contract Security Researcher',
    period: '2024 to present',
    status: 'active',
    accent: 'threat',
    summary: 'Active auditor on Sherlock, Code4rena, and Immunefi.',
    bullets: [
      'Find reentrancy, access-control, and arithmetic-overflow vulnerabilities in Solidity contracts',
      'Write structured exploit reports with proof of concept and mitigation guidance',
      'Run invariant testing and oracle-manipulation analysis with Foundry',
    ],
    stack: ['Solidity', 'Foundry', 'Hardhat', 'Python'],
  },
  {
    company: 'Anak Bangsa Bisa (Generasi Gigih)',
    role: 'Data Analyst',
    period: 'Feb 2022 to Aug 2022',
    status: 'archived',
    accent: 'data',
    summary:
      'Educational data analysis aimed at improving learning quality across West Java province.',
    bullets: [
      'Ran mixed-effects logistic regression and decision-tree analysis on pedagogical efficacy',
      'Found a 3.4x active learning premium, where sandbox learning outperformed passive video 3.4 to 1',
      'Identified an 850ms latency breakpoint for platform responsiveness',
    ],
    stack: ['Python', 'R', 'Mixed-Effects Models', 'scikit-learn'],
  },
] as const

export const SKILLS = [
  {
    category: 'AI and LLM Systems',
    accent: 'agent',
    note: 'Agent orchestration, retrieval, evaluation, serving',
    items: [
      'LangGraph', 'LangChain', 'RAG pipelines', 'Multi-agent orchestration',
      'RLHF', 'Fine-tuning', 'Prompt engineering', 'Guardrail design',
      'Red-teaming', 'vLLM', 'SGLang', 'Groq',
    ],
  },
  {
    category: 'Data Engineering',
    accent: 'data',
    note: 'Medallion architecture, ingestion, transformation, governance',
    items: [
      'ClickHouse', 'PostgreSQL', 'MySQL', 'Oracle SQL', 'dbt-core',
      'Airflow', 'Airbyte', 'OpenMetadata', 'pgvector', 'ChromaDB',
      'ETL and CDC design', 'Medallion DWH',
    ],
  },
  {
    category: 'ML and Research',
    accent: 'signal',
    note: 'Modelling, evaluation, statistics',
    items: [
      'PyTorch', 'TensorFlow', 'scikit-learn', 'XGBoost', 'CatBoost',
      'HuggingFace', 'sentence-transformers', 'Cross-encoder rerankers',
      'NLP', 'Computer Vision', 'Survival analysis', 'RAGAS and T-bench',
    ],
  },
  {
    category: 'Security Research',
    accent: 'threat',
    note: 'Smart contract auditing and adversarial testing',
    items: [
      'Solidity auditing', 'Reentrancy', 'Access control', 'Oracle manipulation',
      'Invariant testing', 'Foundry', 'Sherlock', 'Code4rena', 'Immunefi',
    ],
  },
  {
    category: 'Engineering',
    accent: 'signal',
    note: 'What ships the work',
    items: [
      'Python', 'SQL', 'TypeScript', 'React and Next.js', 'Node.js',
      'FastAPI', 'Docker', 'Git', 'Linux and Ubuntu', 'Playwright',
    ],
  },
  {
    category: 'BI and Analytics',
    accent: 'cred',
    note: 'Stakeholder reporting at enterprise scale',
    items: [
      'Power BI (advanced)', 'Power Query', 'VBA', 'Tableau',
      'Danaos ERP', 'KPI design', 'Financial and compliance reporting',
    ],
  },
] as const

export const QUANT_CASE_STUDIES = [
  {
    title: 'Maritime Fleet Optimization',
    company: 'PT Berlian Laju Tanker',
    method: 'PCA and OLS Regression',
    metrics: {
      'TCE Yield Lift': '11.2%',
      'OPEX Volatility': '-8.5%',
      'R²': '0.74',
    },
    description:
      'Thirty-six months of Danaos ERP data, reduced by PCA and modelled with OLS using robust standard errors. Compliance index came out as the strongest driver of TCE yield at β=0.612, p<0.001. That result moved compliance from a cost line into a revenue lever.',
    chartType: 'line',
    accent: 'cred',
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
    description:
      'Kaplan-Meier survival curves paired with regularized logistic regression across enterprise B2B accounts. API usage intensity beat every demographic feature as a churn predictor. Low-API accounts carried a 310% hazard ratio.',
    chartType: 'survival',
    accent: 'data',
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
    description:
      'A routing model built under HIPAA-equivalent constraints. The fit was not the hard part. The threshold was. Confusion-matrix cost-benefit analysis put the probability floor at 88%, trading recall for a false-positive rate the intake desk could actually absorb.',
    chartType: 'tradeoff',
    accent: 'agent',
  },
  {
    title: 'Pedagogical Efficacy Study',
    company: 'Anak Bangsa Bisa',
    method: 'Mixed-Effects Logistic Regression',
    metrics: {
      'Active Learning Premium': '3.4x',
      'Latency Breakpoint': '850ms',
      'Lead Time': '14 days',
    },
    description:
      'Mixed-effects modelling of sandbox learning against passive video across West Java. Sandbox won 3.4 to 1. Platform latency past 850ms erased the advantage completely, which is what set the engineering budget.',
    chartType: 'bar',
    accent: 'signal',
  },
] as const

/**
 * Rendered when Supabase is unreachable or empty. A portfolio showing an empty
 * grid because a database call failed is worse than one that ships its own
 * content. These come straight from the CV.
 */
export const FALLBACK_PROJECTS = [
  {
    id: 'text2sql',
    title: 'Text2SQL Multi-Agent Platform',
    tagline: 'On-prem agent layer over a fiber network data platform',
    description:
      'End-to-end on-premise AI platform. ClickHouse and PostgreSQL medallion warehouse, dbt-core, Airflow, Airbyte, OpenMetadata, a LangGraph multi-agent Text2SQL layer, and vLLM or SGLang inference. Fully air-gapped for PP 71/2019 data sovereignty.',
    stack: ['LangGraph', 'ClickHouse', 'dbt-core', 'Airflow', 'vLLM', 'FastAPI'],
    category: 'LLM/AI',
    year: 2026,
    featured: true,
    repo_url: null,
    demo_url: null,
    image_url: null,
  },
  {
    id: 'antigravity',
    title: 'Antigravity, RAG Evaluation System',
    tagline: 'A RAGAS replacement that needs no ground-truth API calls',
    description:
      'Production RAG pipeline on LangChain, ChromaDB, a sentence-transformers bi-encoder, a cross-encoder reranker, and Groq inference. The evaluator scores faithfulness, relevance, and retrieval diversity entirely offline.',
    stack: ['LangChain', 'ChromaDB', 'sentence-transformers', 'Groq'],
    category: 'LLM/AI',
    year: 2025,
    featured: true,
    repo_url: null,
    demo_url: null,
    image_url: null,
  },
  {
    id: 'noc-agent',
    title: 'NOC Monitoring AI Agent',
    tagline: 'Natural language incident queries over live telco telemetry',
    description:
      'Network monitoring agent on FastAPI, LangChain, and ClickHouse with WhatsApp delivery through Fonnte. Handles real-time NOC alerting and natural language incident queries against operational data.',
    stack: ['FastAPI', 'LangChain', 'ClickHouse', 'WhatsApp API'],
    category: 'LLM/AI',
    year: 2026,
    featured: true,
    repo_url: null,
    demo_url: null,
    image_url: null,
  },
  {
    id: 'maritime-pa',
    title: 'Maritime Performance Appraisal',
    tagline: 'A parallel state machine in place of sequential approvals',
    description:
      'Role-based appraisal system on React, Node.js, and MySQL covering appraisees, supervisors, reviewers, and decision-makers. Replacing the sequential approval chain with a parallel state machine removed the bottleneck. Weighted scoring and audit logs throughout, covered by Playwright end to end.',
    stack: ['React', 'Node.js', 'MySQL', 'Playwright'],
    category: 'Full Stack',
    year: 2025,
    featured: false,
    repo_url: null,
    demo_url: null,
    image_url: null,
  },
  {
    id: 'medallion',
    title: 'Medallion Data Platform',
    tagline: 'Bronze, Silver, and Gold over undocumented legacy sources',
    description:
      'Medallion architecture feeding AI consumption. ClickHouse for OLAP, PostgreSQL for metadata and serving, dbt-core transformations, Airflow and Airbyte orchestration, OpenMetadata cataloging. Built on top of MySQL and MariaDB systems that had no schema documentation, plus legacy NMS sources.',
    stack: ['ClickHouse', 'PostgreSQL', 'dbt-core', 'Airflow', 'Airbyte', 'OpenMetadata'],
    category: 'Data Engineering',
    year: 2026,
    featured: true,
    repo_url: null,
    demo_url: null,
    image_url: null,
  },
  {
    id: 'web3-audits',
    title: 'Smart Contract Security Research',
    tagline: 'Reentrancy, access control, arithmetic overflow',
    description:
      'Active auditing on Sherlock, Code4rena, and Immunefi. Solidity vulnerability discovery with structured exploit write-ups, invariant testing, and oracle-manipulation analysis.',
    stack: ['Solidity', 'Foundry', 'Hardhat'],
    category: 'Security',
    year: 2024,
    featured: false,
    repo_url: null,
    demo_url: null,
    image_url: null,
  },
] as const

export const EDUCATION = {
  degree: 'B.Sc. Computer Science',
  school: 'Universitas Pancasila, Jakarta',
  graduated: 'July 2023',
  honors: 'Cum Laude, GPA 3.78 of 4.00',
  extras: [
    'National Science Olympiad (OSN Physics), 5th place, 2018',
    'PSN Mathematics finalist, IPB 2016',
    'Computer lab assistant for Algorithms and Data Structures',
  ],
} as const
