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
  availableFor: 'AI Engineering leadership, applied AI architecture, and consulting',
  responseTime: 'Replies within 24 hours',

  /* Served from /public. No database dependency, no expiring signed URL. */
  cvPath: '/cv/Faris_Maulana_CV.pdf',
  quantPath: '/cv/Faris_Maulana_Quantitative_Portfolio.pdf',
} as const

export const NAV_LINKS = [
  { label: 'Leadership', href: '#leadership' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Research', href: '#research' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Contact', href: '#contact' },
] as const

/** The four numbers that carry the hero. Each one is defensible from the CV. */
export const HERO_METRICS = [
  { value: '25,000', unit: 'km', label: 'National fiber backbone I build AI on' },
  { value: '1', unit: '', label: 'AI Engineering function, founded from zero' },
  { value: '5', unit: '+ yrs', label: 'Production AI and data, five industries' },
  { value: '20', unit: '+', label: 'BI dashboards shipped to leadership' },
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
 * Taken from the diploma and transcript in /public/certificates, which are the
 * primary record. Older CV drafts said "B.Sc. Computer Science, July 2023, Cum
 * Laude"; the documents say otherwise, and the documents win.
 */
export const EDUCATION = {
  degree: 'Sarjana Teknik (S.T.), Informatics Engineering',
  school: 'Universitas Pancasila, Jakarta',
  graduated: 'Yudisium 22 Feb 2024',
  honors: 'GPA 3.78 of 4.00, 144 credits',
  thesis: 'American Sign Language classification with a convolutional neural network',
  extras: [
    'National Science Olympiad (OSN Physics), 5th place, 2018',
    'PSN Mathematics finalist, IPB 2016',
    'Computer lab assistant for Algorithms and Data Structures',
  ],
} as const

/* ═══ LEADERSHIP ═════════════════════════════════════════════════════════
   What a hiring manager is actually trying to find out at lead and manager
   level: what this person owns, how they decide, and how they operate. */

export const OWNERSHIP = [
  {
    area: 'The function',
    body: 'Founding AI Engineering hire. Hiring, architecture and delivery for a team that did not exist before May 2026.',
  },
  {
    area: 'The platform',
    body: 'A medallion warehouse (Bronze, Silver, Gold) on ClickHouse, PostgreSQL and dbt-core, fed by Airbyte and Airflow and catalogued in OpenMetadata.',
  },
  {
    area: 'The agent layer',
    body: 'A LangGraph multi-agent Text2SQL system over network operations data, served on-premise with vLLM or SGLang.',
  },
  {
    area: 'The room',
    body: 'Architecture and progress reviews with the founder and IT leadership. Deployment boundaries agreed with operations and security.',
  },
] as const

export const PRINCIPLES = [
  {
    title: 'Start from the process, not the chatbot',
    body: 'I map the business workflow and the source systems first. The interface is the last decision, not the first.',
  },
  {
    title: 'Lineage, access and tests are day-one design',
    body: 'Data lineage, RBAC, testing and observability go into the first architecture review, not the hardening sprint.',
  },
  {
    title: 'AI only where probability is acceptable',
    body: 'Where a wrong answer is costly, a deterministic validator sits behind the model. The agent proposes; the system checks.',
  },
  {
    title: 'Fit the team you actually have',
    body: 'Architecture has to match the infrastructure, the budget, the people and the operating model on the ground today.',
  },
  {
    title: 'Measure in operational terms',
    body: 'Hours of reporting removed, questions answered without an analyst, decisions made faster. Not benchmark points.',
  },
] as const

/** Architecture decisions, written the way they were made. */
export const DECISIONS = [
  {
    id: 'ADR-001',
    title: 'Fully on-premise, air-gapped serving',
    context: 'Operational network data falls under PP 71/2019 data-sovereignty rules.',
    decision: 'No third-party cloud anywhere in the inference path. vLLM and SGLang evaluated on Apple Silicon and Ubuntu servers we control.',
    tradeoff: 'Smaller models and our own ops burden, in exchange for compliance that never has to be argued case by case.',
  },
  {
    id: 'ADR-002',
    title: 'Warehouse before agents',
    context: 'Source systems were MySQL and MariaDB with undocumented schemas, plus legacy NMS tools.',
    decision: 'Build governed Bronze, Silver and Gold layers first. Agents query the Gold layer from the warehouse, never spreadsheets or raw OSS tables.',
    tradeoff: 'The first agent demo ships later. Every answer it gives is traceable to a modelled, catalogued source.',
  },
  {
    id: 'ADR-003',
    title: 'Six agents, not one prompt',
    context: 'A single Text2SQL prompt fails silently: wrong table, wrong join, no explanation.',
    decision: 'Separate schema discovery, planning, SQL generation, validation, execution and answer synthesis into LangGraph nodes.',
    tradeoff: 'More latency and more moving parts, but each stage fails differently and gets its own guardrail and test.',
  },
] as const

/* ═══ CASE STUDIES ═══════════════════════════════════════════════════════ */

export type CaseStatus = 'In development' | 'Proof of concept' | 'Shipped'

export const CASE_STUDIES = [
  {
    id: 'text2sql',
    title: 'Enterprise Text-to-SQL platform',
    org: 'PT Trans Indonesia Superkoridor',
    year: '2026',
    status: 'In development' as CaseStatus,
    accent: 'agent',
    problem:
      'Operations and management staff need answers about the fiber network without knowing the schema. The hard part is not generating SQL. It is choosing the right source, respecting access boundaries, and explaining what was run.',
    approach:
      'Medallion warehouse on ClickHouse, PostgreSQL and dbt-core, ingested by Airbyte and Airflow, catalogued in OpenMetadata. A LangGraph graph splits discovery, planning, generation, validation, execution and synthesis. Served on-prem by vLLM or SGLang.',
    outcome:
      'Still being built. The target is a controlled path from OSS data to traceable natural-language decision support, sourced through the warehouse rather than spreadsheet exports.',
    stack: ['LangGraph', 'ClickHouse', 'PostgreSQL', 'dbt-core', 'Airflow', 'OpenMetadata', 'vLLM'],
  },
  {
    id: 'noc-agent',
    title: 'NOC monitoring agent',
    org: 'Telco infrastructure',
    year: '2026',
    status: 'Proof of concept' as CaseStatus,
    accent: 'signal',
    problem:
      'NOC engineers need incident and telemetry answers fast, often without knowing which table holds them or how to query it.',
    approach:
      'FastAPI and LangChain over ClickHouse, with alert delivery to WhatsApp. Natural-language incident questions and proactive alerts through one channel.',
    outcome:
      'Showed conversational access can sit on top of network data and shorten triage. Production would need stronger authorisation, alert rules, observability and integration tests, and those are listed as the gap, not hidden.',
    stack: ['FastAPI', 'LangChain', 'ClickHouse', 'WhatsApp API'],
  },
  {
    id: 'rag-eval',
    title: 'RAG pipeline and evaluation framework',
    org: 'Independent build',
    year: '2025',
    status: 'Shipped' as CaseStatus,
    accent: 'agent',
    problem:
      'Most RAG demos retrieve and generate and stop there. Without evaluation there is no way to know whether retrieval or generation is the weak link.',
    approach:
      'Ingests 50+ AI and ML articles into ChromaDB, retrieves with a bi-encoder, reranks with a cross-encoder, generates through Groq, then scores faithfulness, relevance and retrieval diversity without ground-truth API calls.',
    outcome:
      'A modular system covering ingestion, retrieval, reranking, generation and evaluation, with a Gradio interface. It is the reference I use when advising clients on RAG quality.',
    stack: ['LangChain', 'ChromaDB', 'sentence-transformers', 'Cross-encoder', 'Groq', 'Gradio'],
  },
  {
    id: 'appraisal',
    title: 'Maritime performance appraisal',
    org: 'PT Berlian Laju Tanker',
    year: '2025',
    status: 'Shipped' as CaseStatus,
    accent: 'data',
    problem:
      'A multi-role, multi-stage appraisal ran sequentially. One slow appraiser held up everyone behind them.',
    approach:
      'RBAC across appraisees, supervisors, reviewers and decision makers, and a parallel state machine so peers in the same stage work independently. Weighted scoring, audit logs, Playwright end-to-end tests.',
    outcome:
      'A fragmented process became one traceable workflow, with progress, permissions and scoring visible across the whole appraisal cycle.',
    stack: ['React', 'Node.js', 'MySQL', 'Playwright'],
  },
] as const
