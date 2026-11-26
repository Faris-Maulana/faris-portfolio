export const SITE_CONFIG = {
  name: 'Faris Maulana',
  role: 'Manager, AI Engineering',
  company: 'PT Trans Indonesia Superkoridor',
  title: 'AI Engineering Manager. LLM Systems and Multi-Agent Architecture',
  tagline:
    'I turn operational data, infrastructure constraints and business decisions into AI systems with explicit controls and measurable failure modes.',
  email: 'maulanafaris016@gmail.com',
  whatsapp: '+6281284049172',
  whatsappLink: 'https://wa.me/6281284049172',
  linkedin: 'https://www.linkedin.com/in/faris-maulana-0035b914a/',
  github: 'https://github.com/Faris-Maulana',
  location: 'Bogor / Jakarta, Indonesia',
  timezone: 'GMT+7',
  availability: {
    open: true,
    status: 'Selected advisory and leadership conversations',
    detail: 'AI engineering leadership, applied architecture and technical diligence',
  },
  contactMode: 'Direct, asynchronous technical review',
  cvPath: '/cv/Faris_Maulana_CV.pdf',
  quantPath: '/cv/Faris_Maulana_Quantitative_Portfolio.pdf',
} as const

export const NAV_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'SIMPUL', href: '/simpul' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Experience', href: '#experience' },
  { label: 'Research', href: '#research' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Contact', href: '#contact' },
] as const

export const HERO_METRICS = [
  { value: '25,000', unit: 'km', label: 'National fiber backbone context' },
  { value: '3', unit: 'layers', label: 'Function, data platform and agents' },
  { value: '5', unit: '+ years', label: 'AI, data and production delivery' },
] as const

export const EXPERIENCES = [
  {
    company: 'PT Trans Indonesia Superkoridor',
    role: 'Manager, AI Engineering',
    period: 'May 2026 to present',
    status: 'active',
    accent: 'signal',
    summary: 'Founding AI Engineering hire at a neutral national DWDM fiber backbone operator. I own the function, platform and agent layer.',
    bullets: [
      'Built the AI Engineering function from zero, covering architecture, delivery planning and capability building',
      'Designed a medallion platform on ClickHouse and PostgreSQL with dbt-core, Airflow, Airbyte and OpenMetadata',
      'Architecting a LangGraph Text2SQL system over NMS uptime, NOC logs and billing data with separate discovery, planning, generation, validation and synthesis stages',
      'Evaluated on-premise LLM serving with vLLM and SGLang for an air-gapped deployment boundary',
      'Present architecture and platform progress directly to the founder and IT leadership',
    ],
    stack: ['LangGraph', 'ClickHouse', 'PostgreSQL', 'dbt-core', 'Airflow', 'vLLM', 'FastAPI'],
  },
  {
    company: 'iMerit Technology',
    role: 'Master Consultant, AI Engineer',
    period: 'Dec 2025 to present',
    status: 'active',
    accent: 'agent',
    summary: 'End-to-end LLM consulting for enterprise clients, from problem definition and evaluation through deployment planning.',
    bullets: [
      'Own problem definition, dataset strategy, evaluation, fine-tuning and deployment against client requirements',
      'Design task-specific fine-tuning pipelines with domain-labeled data and adversarial review',
      'Built an evaluation approach covering faithfulness, answer relevance and retrieval diversity',
      'Advise on retrieval patterns, vector stores, guardrails and AI governance',
    ],
    stack: ['LangChain', 'ChromaDB', 'sentence-transformers', 'Cross-encoders', 'RLHF'],
  },
  {
    company: 'PT Berlian Laju Tanker Tbk',
    role: 'Data Analyst, AI and BI',
    period: 'Dec 2024 to May 2026',
    status: 'completed',
    accent: 'cred',
    summary: 'Fleet-wide business intelligence and quantitative analysis across tanker and gas carrier operations.',
    bullets: [
      'Built and maintained 20+ Power BI dashboards across Technical, Safety, Operations, Commercial, Finance and subsidiaries',
      'Engineered SQL and Oracle queries across Danaos ERP, B-Path and B-One into one reporting layer',
      'Analysed 36 months of Danaos data using PCA and OLS with robust standard errors as an observational association study',
      'Shipped a crew Performance Assessment app on React, Node.js and MySQL with role-based access, parallel workflow and Playwright coverage',
      'Directed annual technical budgeting for 11 vessels and prepared audit-ready reconciliations',
    ],
    stack: ['Power BI', 'Oracle SQL', 'Danaos ERP', 'Python', 'React', 'Playwright'],
  },
  {
    company: 'Toyota Research Institute',
    role: 'Lead Data Scientist',
    period: 'Mar 2024 to Nov 2024',
    status: 'completed',
    accent: 'agent',
    summary: 'Applied machine learning to healthcare and automotive research under strict data-handling constraints.',
    bullets: [
      'Applied regression, decision trees and clustering with Python and PyTorch to research datasets',
      'Used regression and routing analysis to study clinical intake efficiency',
      'Ran confusion-matrix cost-benefit analysis to balance true-positive gain against administrative false-positive load',
      'Translated high-dimensional findings into recommendations for research and business teams',
    ],
    stack: ['Python', 'PyTorch', 'scikit-learn', 'Biostatistics'],
  },
  {
    company: 'Telkom Indonesia',
    role: 'Data Scientist',
    period: 'Feb 2023 to Nov 2024',
    status: 'completed',
    accent: 'data',
    summary: 'AI product roadmaps, production NLP and computer vision, and enterprise account modelling.',
    bullets: [
      'Owned an AI product roadmap aligned with Telkom Strategic Insights initiatives',
      'Delivered NLP for text and speech plus computer vision projects behind REST APIs',
      'Modelled B2B churn with Kaplan-Meier survival analysis and regularized logistic regression',
      'Built production ETL on Oracle, ClickHouse and PostgreSQL and wrote business cases for AI initiatives',
    ],
    stack: ['Python', 'Oracle SQL', 'ClickHouse', 'Survival Analysis', 'NLP', 'Computer Vision'],
  },
  {
    company: 'Independent, Web3 Security',
    role: 'Smart Contract Security Researcher',
    period: '2024 to present',
    status: 'active',
    accent: 'threat',
    summary: 'Adversarial review practice across Solidity systems and public audit platforms.',
    bullets: [
      'Review reentrancy, access-control and arithmetic risk in Solidity contracts',
      'Structure exploit reports around reproducible proof of concept and mitigation guidance',
      'Use invariant testing and oracle-manipulation analysis with Foundry',
    ],
    stack: ['Solidity', 'Foundry', 'Hardhat', 'Sherlock', 'Code4rena'],
  },
  {
    company: 'Anak Bangsa Bisa (Generasi Gigih)',
    role: 'Data Analyst',
    period: 'Feb 2022 to Aug 2022',
    status: 'archived',
    accent: 'data',
    summary: 'Educational data analysis covering learning modes and platform behaviour.',
    bullets: [
      'Used mixed-effects logistic regression and decision-tree analysis to study pedagogical efficacy',
      'Compared sandbox and passive-video learning while accounting for grouped observations',
      'Investigated responsiveness as a potential modifier of learning outcomes',
    ],
    stack: ['Python', 'R', 'Mixed-Effects Models', 'scikit-learn'],
  },
] as const

export const SKILLS = [
  { category: 'AI systems', accent: 'agent', note: 'Orchestration, retrieval, evaluation and serving', items: ['LangGraph', 'LangChain', 'RAG', 'Fine-tuning', 'Guardrails', 'vLLM', 'SGLang'] },
  { category: 'Data platforms', accent: 'data', note: 'Governed pipelines and decision-ready models', items: ['ClickHouse', 'PostgreSQL', 'Oracle SQL', 'dbt-core', 'Airflow', 'Airbyte', 'OpenMetadata'] },
  { category: 'Evaluation', accent: 'signal', note: 'Quality separated into observable failure modes', items: ['Golden datasets', 'RAG evaluation', 'Red-teaming', 'Playwright', 'Survival analysis', 'Experiment design'] },
  { category: 'Delivery', accent: 'cred', note: 'From architecture review to operable software', items: ['Python', 'TypeScript', 'Next.js', 'FastAPI', 'Docker', 'Power BI', 'Technical roadmaps'] },
  { category: 'Adversarial review', accent: 'threat', note: 'Security as an engineering input', items: ['Solidity', 'Foundry', 'Invariant testing', 'Access control', 'Oracle manipulation', 'Proof of concept'] },
] as const

/**
 * Method notes, not performance charts. Original notebooks and private source
 * records are not published, so unsupported precision is intentionally absent.
 */
export const QUANT_CASE_STUDIES = [
  {
    title: 'Fleet economics association study',
    company: 'PT Berlian Laju Tanker',
    method: 'PCA + OLS with robust standard errors',
    question: 'Which operational and compliance signals are associated with TCE yield in the available ERP history?',
    approach: 'Reduce correlated operational inputs, fit an observational regression and inspect residual and stability behaviour before discussing operational hypotheses.',
    evidence: [{ label: 'Observation window', value: '36 months' }, { label: 'Inferential frame', value: 'Associational' }, { label: 'Source', value: 'Private ERP records' }],
    limitation: 'Observational coefficients do not establish a causal lift. Original model artifacts are required before publishing coefficient or outcome precision.',
    accent: 'cred',
  },
  {
    title: 'Enterprise churn risk framing',
    company: 'Telkom Indonesia',
    method: 'Survival analysis + regularized classification',
    question: 'How can account behaviour inform retention prioritisation without reducing churn to one opaque score?',
    approach: 'Separate time-to-event behaviour from account classification, inspect API-usage signals and define the intervention each risk segment should trigger.',
    evidence: [{ label: 'Unit of analysis', value: 'B2B accounts' }, { label: 'Temporal view', value: 'Kaplan-Meier' }, { label: 'Decision output', value: 'Risk segments' }],
    limitation: 'Reported historical performance is not reproduced here. Cohort definitions, censoring and calibration must be reviewed before reusing the model.',
    accent: 'data',
  },
  {
    title: 'Triage decision-cost analysis',
    company: 'Toyota Research Institute',
    method: 'Regression + confusion-matrix costing',
    question: 'Which operating threshold balances intake efficiency against the administrative cost of false positives?',
    approach: 'Make the error-cost matrix explicit, assess candidate thresholds against desk capacity and separate continuous prediction from classification decisions.',
    evidence: [{ label: 'Evaluation lens', value: 'Error cost' }, { label: 'Constraint', value: 'Restricted data' }, { label: 'Decision output', value: 'Operating threshold' }],
    limitation: 'No patient data or verifiable operating curve is published. A threshold is task-specific and must not be presented as a universal optimum.',
    accent: 'agent',
  },
  {
    title: 'Learning-mode efficacy study',
    company: 'Anak Bangsa Bisa',
    method: 'Mixed-effects logistic regression',
    question: 'How do learning mode and platform responsiveness relate to observed learning outcomes across groups?',
    approach: 'Model grouped observations rather than treating every learner as independent, then test whether technical conditions change the estimated relationship.',
    evidence: [{ label: 'Design feature', value: 'Grouped observations' }, { label: 'Comparison', value: 'Active vs passive' }, { label: 'Engineering lens', value: 'Responsiveness' }],
    limitation: 'Effect sizes and latency cutoffs require the original study design for interpretation. They are not transferable product benchmarks.',
    accent: 'signal',
  },
] as const

export const EDUCATION = {
  degree: 'Sarjana Teknik (S.T.), Informatics Engineering',
  school: 'Universitas Pancasila, Jakarta',
  graduated: 'Yudisium 22 Feb 2024',
  honors: 'GPA 3.78 of 4.00, 144 credits',
  thesis: 'American Sign Language classification with a convolutional neural network',
  extras: ['National Science Olympiad Physics, 5th place, 2018', 'PSN Mathematics finalist, IPB 2016', 'Computer lab assistant for Algorithms and Data Structures'],
} as const

export const OWNERSHIP = [
  { area: 'Function', index: '01', body: 'Create the engineering mandate, prioritise the portfolio and make delivery risks visible to leadership.' },
  { area: 'Platform', index: '02', body: 'Build governed Bronze, Silver and Gold layers so applications consume traceable data instead of spreadsheet exports.' },
  { area: 'Agents', index: '03', body: 'Decompose open-ended model behaviour into inspectable planning, validation, execution and synthesis boundaries.' },
  { area: 'Operations', index: '04', body: 'Agree deployment, access and incident boundaries with infrastructure, security and the teams who own the workflow.' },
] as const

export const PRINCIPLES = [
  { title: 'Process before interface', body: 'Map the decision, source systems and human escalation path before choosing a chatbot or agent framework.' },
  { title: 'Controls at the boundary', body: 'Put deterministic validation between probabilistic generation and consequential execution.' },
  { title: 'Evaluation before scale', body: 'Define golden tasks, adversarial cases and release thresholds while the system is still cheap to change.' },
  { title: 'Operations as architecture', body: 'Design for the people, infrastructure, budget and on-call reality that will actually run the system.' },
] as const

export const DECISIONS = [
  { id: 'ADR-001', title: 'Air-gapped inference', context: 'Operational data requires a strict deployment boundary.', decision: 'Evaluate vLLM and SGLang on controlled infrastructure without third-party cloud inference.', tradeoff: 'More ownership of model operations in exchange for a clear compliance and data path.' },
  { id: 'ADR-002', title: 'Warehouse before agents', context: 'Undocumented operational schemas make direct model access brittle.', decision: 'Model and catalogue governed data layers before connecting an agent.', tradeoff: 'A later demo, but answers can be traced to modelled sources.' },
  { id: 'ADR-003', title: 'Separate reasoning stages', context: 'A single Text2SQL prompt obscures table, join and execution failures.', decision: 'Split discovery, planning, generation, validation, execution and synthesis into graph stages.', tradeoff: 'More orchestration and latency, with independently testable failure modes.' },
] as const

export type CaseStatus = 'In development' | 'Proof of concept' | 'Public reference' | 'Internally deployed'

export const CASE_STUDIES = [
  {
    id: 'simpul', title: 'SIMPUL incident proving ground', org: 'Independent infrastructure lab', year: '2026', status: 'Public reference' as CaseStatus, accent: 'signal',
    problem: 'An operational agent can sound competent while hiding why it acted, whether it was authorised, or what a different decision would have changed.',
    approach: 'A deterministic event-sourced simulator for synthetic fiber incidents, with replayable evidence, counterfactual branches and an execution-time policy gate.',
    outcome: 'An interactive public reference run. It demonstrates simulation and authorization boundaries, not live model quality or production network control.',
    stack: ['TypeScript', 'Next.js', 'Event sourcing', 'SVG', 'Policy engine'],
  },
  {
    id: 'wealth-advisor', title: 'Wealth Advisor agent workflow', org: 'Independent build', year: '2026', status: 'Public reference' as CaseStatus, accent: 'agent',
    problem: 'Advisory automation needs explicit review before uncertain findings become recommendations, plus graceful degradation when upstream data fails.',
    approach: 'A deterministic multi-agent state machine with least-privilege tools, anomaly detectors, checkpoints, reviewer decisions and a browser-executable Python package.',
    outcome: 'A public implementation with synthetic scenarios, committed outputs and an interactive browser demo. Detector calibration and production tenancy remain open.',
    stack: ['Python', 'FastAPI', 'Pyodide', 'SQLite', 'Human review'],
  },
  {
    id: 'ottodot', title: 'Ottodot booking consistency', org: 'Backend engineering exercise', year: '2026', status: 'Public reference' as CaseStatus, accent: 'data',
    problem: 'Two parents can attempt to pay for the same final trial-class seat. Capacity and payment correctness must survive concurrency, retries and partial failure.',
    approach: 'Authorize, allocate and capture as separate steps, guarded by a class transaction, compensating actions, idempotency and database constraints.',
    outcome: 'A public implementation focused on race tests, invariant checks and payment-state correctness rather than frontend polish.',
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'SQL constraints', 'Concurrency tests'],
  },
  {
    id: 'rag-eval', title: 'RAG evaluation framework', org: 'Independent build', year: '2026', status: 'Public reference' as CaseStatus, accent: 'agent',
    problem: 'A RAG demo can sound coherent while retrieval or grounding fails. Quality needs to be decomposed into observable failure modes.',
    approach: 'Bi-encoder retrieval, cross-encoder reranking and cited generation are paired with retrieval, generation and corpus-level evaluation.',
    outcome: 'A public reference implementation with raw retrieval results and explicit unpublished evaluation areas. Generation and fine-tuning scores are not claimed.',
    stack: ['LangChain', 'ChromaDB', 'sentence-transformers', 'Cross-encoder', 'Gradio'],
  },
  {
    id: 'text2sql', title: 'Enterprise Text-to-SQL platform', org: 'PT Trans Indonesia Superkoridor', year: '2026', status: 'In development' as CaseStatus, accent: 'agent',
    problem: 'Operations staff need answers about a fiber network without learning its schemas. The system must choose approved sources, enforce access and expose what was executed.',
    approach: 'A governed medallion warehouse feeds a LangGraph pipeline with explicit discovery, planning, generation, validation and synthesis stages, deployed inside an on-premise inference boundary.',
    outcome: 'In development. Release metrics remain unpublished until a representative golden evaluation harness has run.',
    stack: ['LangGraph', 'ClickHouse', 'PostgreSQL', 'dbt-core', 'OpenMetadata', 'vLLM'],
  },
  {
    id: 'noc-agent', title: 'NOC monitoring agent', org: 'Telco infrastructure', year: '2026', status: 'Proof of concept' as CaseStatus, accent: 'signal',
    problem: 'NOC engineers need incident and telemetry answers without first locating the right table or constructing the right query.',
    approach: 'FastAPI and LangChain over ClickHouse, with a separate WhatsApp alert path for proactive monitoring. SIMPUL now carries the public simulation track.',
    outcome: 'Validated the interaction model. Production requires stronger authorisation, alert policy, observability and integration coverage.',
    stack: ['FastAPI', 'LangChain', 'ClickHouse', 'WhatsApp API'],
  },
  {
    id: 'appraisal', title: 'Maritime performance appraisal', org: 'PT Berlian Laju Tanker', year: '2025', status: 'Internally deployed' as CaseStatus, accent: 'data',
    problem: 'A multi-role appraisal encoded as a sequential process allowed one delayed review to block independent peers.',
    approach: 'Role-based access, a parallel state machine, weighted scoring, audit logs and Playwright end-to-end coverage.',
    outcome: 'An internally deployed workflow with explicit permissions and scoring. Confidential implementation and personnel records are not public evidence.',
    stack: ['React', 'Node.js', 'MySQL', 'Playwright'],
  },
] as const
