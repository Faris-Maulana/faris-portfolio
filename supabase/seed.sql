-- Seed data for faris-portfolio
insert into public.projects (title, tagline, description, stack, category, featured, year, sort_order) values
(
  'Text2SQL Multi-Agent Platform',
  'LangGraph-orchestrated Text2SQL over fiber-network telemetry',
  'End-to-end on-premise AI platform with Bronze/Silver/Gold medallion DWH (ClickHouse + PostgreSQL), dbt-core transformations, Airflow + Airbyte ingestion. LangGraph multi-agent system for natural-language queries over NMS uptime, NOC logs, and billing data. PP 71/2019 compliant — fully air-gapped.',
  ARRAY['LangGraph','ClickHouse','PostgreSQL','dbt-core','Airflow','Airbyte','FastAPI','vLLM'],
  'LLM/AI', true, 2026, 1
),
(
  'Antigravity — RAG Evaluation System',
  'Production-grade RAG pipeline with custom RAGAS-replacement evaluation',
  'LangChain + ChromaDB + sentence-transformers bi-encoder retrieval + cross-encoder reranker + Groq inference. Custom evaluation framework measuring faithfulness, answer relevance, and context precision without ground-truth API calls.',
  ARRAY['LangChain','ChromaDB','sentence-transformers','Groq','FastAPI','Gradio'],
  'LLM/AI', true, 2025, 2
),
(
  'NOC Monitoring AI Agent',
  'Real-time network monitoring with WhatsApp alerting',
  'FastAPI + LangChain + ClickHouse + Fonnte WhatsApp integration for real-time NOC alerting and natural-language incident queries over structured telemetry data.',
  ARRAY['FastAPI','LangChain','ClickHouse','Fonnte','Docker'],
  'LLM/AI', true, 2026, 3
),
(
  'Maritime Fleet PA System',
  'Full-stack performance appraisal workflow engine for maritime fleet',
  'Custom RBAC layer for Appraisees/Supervisors/Reviewers/Decision Makers. Parallel async state-machine, weighted-score aggregation, Playwright E2E testing, audit logging.',
  ARRAY['React','Next.js','PostgreSQL','Playwright','Docker'],
  'Full Stack', false, 2025, 4
),
(
  'Smart Contract Security Research',
  'Reentrancy, access-control & overflow vulnerability discovery',
  'Active auditor on Sherlock, Code4rena, Immunefi. Discovering reentrancy, access-control, and arithmetic overflow vulnerabilities in Solidity smart contracts. AI-assisted exploit generation for blockchain security analysis.',
  ARRAY['Solidity','Python','Foundry','Hardhat'],
  'Security', true, 2024, 5
);

insert into public.blog_posts (slug, title, excerpt, tags, published, read_time_min) values
(
  'text2sql-multi-agent-architecture',
  'Building a Text2SQL Multi-Agent System on PP 71/2019 Compliant Infrastructure',
  'How I designed a LangGraph-orchestrated Text2SQL system for fiber-network telemetry data, fully air-gapped under Indonesian data sovereignty compliance.',
  ARRAY['LangGraph','Text2SQL','Data Engineering','AI'],
  false, 12
),
(
  'rag-evaluation-without-ground-truth',
  'RAG Evaluation Without Ground Truth: Custom RAGAS Replacement',
  'Why I built a custom faithfulness + relevance evaluator instead of using RAGAS, and how it performed on the Antigravity system.',
  ARRAY['RAG','LangChain','Evaluation','NLP'],
  false, 8
);
