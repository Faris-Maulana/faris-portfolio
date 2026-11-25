import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const output = new URL('../public/cv/', import.meta.url)
await mkdir(output, { recursive: true })
const destination = new URL('Faris_Maulana_CV.pdf', output)
const siteUrl = 'https://faris-portfolio-red.vercel.app'
const pinnedEvidence = {
  ragReport: 'https://github.com/Faris-Maulana/rag-system/blob/90e16d5d52b20f670cc3a0dd4fcf8a0db5a35427/results/retrieval_report.json',
  wealthTrace: 'https://github.com/Faris-Maulana/wealth-advisor-agents/blob/16cbe678197b8976fa40533dcf85ea8fe5fa1d22/samples/output/run_log.jsonl',
  ottodotTests: 'https://github.com/Faris-Maulana/ottodot-trial-booking/blob/d30ae63cb9d162e4d985f95e095826ed275e5ea1/tests/concurrency.test.ts',
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Faris Maulana, Executive CV</title>
<style>
  @page { size: A4; margin: 11mm 14mm 12mm; }
  * { box-sizing: border-box; }
  :root { color-scheme: light; --ink: #17201b; --muted: #526058; --line: #c8d0c9; --accent: #365d42; --wash: #eef2ed; }
  body { margin: 0; color: var(--ink); font-family: Arial, sans-serif; font-size: 8.5pt; line-height: 1.29; }
  header { display: grid; grid-template-columns: 1fr auto; gap: 12mm; align-items: end; padding-bottom: 5mm; border-bottom: 1.6pt solid var(--accent); }
  h1 { margin: 0; font-size: 28pt; line-height: 0.95; letter-spacing: -0.8pt; }
  .role { margin: 2.5mm 0 0; color: var(--accent); font-size: 10.5pt; font-weight: 700; }
  .contact { max-width: 61mm; color: var(--muted); font-size: 7.7pt; text-align: right; overflow-wrap: anywhere; }
  .contact p { margin: 0 0 1.2mm; }
  h2 { margin: 4mm 0 2mm; color: var(--accent); font-size: 9pt; letter-spacing: 1.1pt; text-transform: uppercase; }
  h3 { margin: 0; font-size: 10pt; line-height: 1.2; }
  p { margin: 0 0 1.7mm; }
  ul { margin: 1.4mm 0 0; padding-left: 4mm; }
  li { margin: 0 0 1mm; padding-left: 0.6mm; }
  li::marker { color: var(--accent); }
  a { color: inherit; }
  .summary { color: var(--muted); }
  .entry { margin: 0 0 3.2mm; break-inside: avoid; }
  .entry-head { display: flex; gap: 4mm; justify-content: space-between; align-items: baseline; }
  .period { color: var(--muted); font-size: 7.8pt; white-space: nowrap; }
  .meta { margin-top: 0.8mm; color: var(--muted); font-size: 8pt; }
  .projects { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4mm 5mm; }
  .project { padding: 2.5mm 3mm; border-top: 0.7pt solid var(--line); background: var(--wash); break-inside: avoid; }
  .project h3 { font-size: 9.2pt; }
  .project p { margin-top: 1.2mm; color: var(--muted); font-size: 8.1pt; }
  .status { display: block; margin-bottom: 1.2mm; color: var(--accent); font-size: 6.8pt; font-weight: 700; letter-spacing: 0.35pt; text-transform: uppercase; }
  .skills { display: grid; grid-template-columns: 32mm 1fr; gap: 1.2mm 3mm; }
  .skills dt { color: var(--accent); font-weight: 700; }
  .skills dd { margin: 0; color: var(--muted); }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
  .note { padding: 2.5mm 3mm; border-left: 1.2pt solid var(--accent); background: var(--wash); color: var(--muted); }
  .small { color: var(--muted); font-size: 7.7pt; }
  .bold { font-weight: 700; }
  .page-break { break-before: page; }
  .page-break h2 { margin-top: 0; }
  .page-break ~ section h2 { margin-top: 3.5mm; }
  footer { margin-top: 2mm; padding-top: 2mm; border-top: 0.5pt solid var(--line); color: var(--muted); font-size: 7pt; }
</style>
</head>
<body>
<header>
  <div><h1>FARIS MAULANA</h1><p class="role">Manager, AI Engineering</p><p class="meta">LLM systems / data platforms / evaluation / operational controls</p></div>
  <div class="contact"><p>Bogor / Jakarta, Indonesia</p><p><a href="mailto:maulanafaris016@gmail.com">maulanafaris016@gmail.com</a><br><a href="https://wa.me/6281284049172" aria-label="WhatsApp: +62 812 8404 9172">+62 812 8404 9172</a></p><p><a href="https://www.linkedin.com/in/faris-maulana-0035b914a/" aria-label="Faris Maulana on LinkedIn">linkedin.com/in/faris-maulana-0035b914a</a><br><a href="https://github.com/Faris-Maulana" aria-label="Faris Maulana on GitHub">github.com/Faris-Maulana</a></p><p><a href="${siteUrl}/" aria-label="Faris Maulana portfolio">faris-portfolio-red.vercel.app</a></p></div>
</header>

<section><h2>Executive profile</h2><p class="summary">AI Engineering Manager with 5+ years across LLM systems, data engineering, applied machine learning and enterprise analytics. Currently building the AI Engineering function at a national DWDM fiber backbone operator, with ownership across platform architecture, evaluation and controlled agent workflows. Public work emphasizes reproducible evidence, explicit maturity and executable controls over unsupported outcome claims.</p></section>

<section><h2>Professional experience</h2>
  <article class="entry"><div class="entry-head"><h3>Manager, AI Engineering / PT Trans Indonesia Superkoridor</h3><span class="period">May 2026 to present</span></div><p class="meta">Jakarta, Indonesia / Founding AI Engineering hire at a neutral national DWDM fiber backbone operator</p><ul>
    <li>Building the AI Engineering function, data platform and agent layer, including architecture, delivery planning and capability development.</li>
    <li>Designed a Bronze, Silver and Gold data platform using ClickHouse, PostgreSQL, dbt-core, Airflow, Airbyte and OpenMetadata for governed AI consumption.</li>
    <li>Architecting an in-development Text2SQL workflow for operational questions, with separate schema discovery, planning, generation, validation, execution and synthesis.</li>
    <li>Mapping ETL and CDC paths across legacy operational and monitoring sources, with public documentation restricted to implementation-level abstraction.</li>
    <li>Evaluating on-premise inference with vLLM and SGLang for an air-gapped deployment boundary; presenting technical decisions to founder and IT leadership.</li>
  </ul></article>
  <article class="entry"><div class="entry-head"><h3>Master Consultant, AI Engineer / iMerit Technology</h3><span class="period">Dec 2025 to present</span></div><p class="meta">Remote / Enterprise LLM consulting</p><ul>
    <li>Own problem framing, dataset strategy, evaluation design, fine-tuning and deployment planning against client requirements.</li>
    <li>Design task-specific data and red-teaming workflows with domain experts and annotation teams, including labeling guidance and adversarial cases.</li>
    <li>Advise on retrieval architecture, guardrails, model evaluation and AI governance without treating prototype behavior as production evidence.</li>
  </ul></article>
  <article class="entry"><div class="entry-head"><h3>Data Analyst, AI and BI / PT Berlian Laju Tanker Tbk</h3><span class="period">Dec 2024 to May 2026</span></div><p class="meta">Jakarta, Indonesia / Tanker and gas carrier operations</p><ul>
    <li>Built and maintained 20+ Power BI dashboards across Technical, Safety, Operations, Commercial, Finance and subsidiary teams.</li>
    <li>Engineered SQL and Oracle queries across Danaos ERP, B-Path and B-One into a consolidated reporting layer.</li>
    <li>Analyzed 36 months of operational history with PCA and OLS using robust standard errors as an observational association study, not a causal lift estimate.</li>
    <li>Designed and deployed a crew appraisal application using React, Node.js and MySQL, with RBAC, parallel review states, weighted scoring and Playwright coverage.</li>
    <li>Directed annual technical budgeting for 11 vessels and prepared audit-ready reconciliations; maintained Danaos planned maintenance records.</li>
  </ul></article>
  <article class="entry"><div class="entry-head"><h3>Lead Data Scientist / Toyota Research Institute</h3><span class="period">Mar 2024 to Nov 2024</span></div><p class="meta">Jakarta Metropolitan Area / Healthcare and automotive research</p><ul><li>Applied regression, decision trees and clustering using Python and PyTorch under restricted data-handling requirements.</li><li>Evaluated intake decisions with regression and confusion-matrix costing, separating predictive scores from operational thresholds.</li></ul></article>
  <article class="entry"><div class="entry-head"><h3>Data Scientist / Telkom Indonesia</h3><span class="period">Feb 2023 to Nov 2024</span></div><p class="meta">Jakarta, Indonesia / AI products and enterprise accounts</p><ul><li>Owned AI roadmap initiatives and delivered NLP, speech and computer vision work behind REST interfaces.</li><li>Modeled B2B churn with Kaplan-Meier analysis and regularized classification; built ETL across Oracle, ClickHouse and PostgreSQL.</li></ul></article>
</section>

<section class="page-break"><h2>Selected public engineering work</h2><div class="projects">
  <article class="project"><span class="status"><a href="${siteUrl}/simpul" aria-label="Open SIMPUL synthetic simulator">Public reference / synthetic simulator</a></span><h3><a href="${siteUrl}/work/simpul">SIMPUL incident proving ground</a></h3><p>Deterministic event-sourced synthetic fiber incidents, network replay, counterfactual branches and an execution-time policy gate. No live-model or production-control claim.</p></article>
  <article class="project"><span class="status"><a href="https://faris-maulana.github.io/wealth-advisor-agents/" aria-label="Open synthetic Wealth Advisor browser demo">Public reference / browser demo</a></span><h3><a href="${siteUrl}/work/wealth-advisor">Wealth Advisor agent workflow</a></h3><p>Deterministic orchestration, least-privilege tools, anomaly detectors, human checkpoints, <a href="${pinnedEvidence.wealthTrace}" aria-label="Pinned synthetic Wealth Advisor execution trace">fallback traces</a> and synthetic scenarios running in Python and Pyodide.</p></article>
  <article class="project"><span class="status">Public reference / consistency engineering</span><h3><a href="${siteUrl}/work/ottodot">Ottodot trial booking</a></h3><p>Authorize, allocate and capture flow with compensating actions, idempotency, database constraints, <a href="${pinnedEvidence.ottodotTests}" aria-label="Pinned Ottodot concurrency tests">concurrency tests</a> and global invariant checks.</p></article>
  <article class="project"><span class="status">Public reference / retrieval evidence</span><h3><a href="${siteUrl}/work/rag-eval">RAG evaluation system</a></h3><p>Dense retrieval, cross-encoder reranking and cited generation. A <a href="${pinnedEvidence.ragReport}" aria-label="Pinned retrieval-only evaluation report">published 20-query report</a> uses a lexical retrieval proxy; generation and fine-tuning scores remain unpublished.</p></article>
  <article class="project"><span class="status">In development / private operational data</span><h3><a href="${siteUrl}/work/text2sql">Enterprise Text2SQL platform</a></h3><p>Governed medallion sources and explicit query stages, designed around on-premise inference and deterministic syntax, permission and query-scope checks.</p></article>
  <article class="project"><span class="status">Proof of concept / internal workflow</span><h3><a href="${siteUrl}/work/noc-agent">NOC monitoring</a> and <a href="${siteUrl}/work/appraisal">maritime appraisal</a></h3><p>Conversational NOC support with explicit production gaps; internally deployed role-based parallel appraisal workflow with confidential personnel data excluded.</p></article>
</div></section>

<section><h2>Additional experience</h2>
  <article class="entry"><div class="entry-head"><h3>Smart Contract Security Researcher / Independent</h3><span class="period">2024 to present</span></div><ul><li>Review Solidity assets, actors and trust boundaries across reentrancy, access control, arithmetic and oracle-manipulation risks.</li><li>Structure review around reproducible PoCs, invariants and testable mitigations. No individual accepted finding is asserted in this CV without a public adjudication artifact.</li></ul></article>
  <p class="small"><span class="bold">Earlier roles:</span> Sales and E-Commerce Analyst, torch.id; Data Scientist Intern, PT Rajawali Nusantara Indonesia; Content Developer Intern, PACMANN; Data Analyst Intern, Generasi Gigih; AI for Startup Intern, Orbit Future Academy; Computer Lab Assistant, Universitas Pancasila.</p>
</section>

<section><h2>Technical skills</h2><dl class="skills">
  <dt>AI systems</dt><dd>LangGraph, LangChain, retrieval architecture, evaluation, fine-tuning, guardrails, vLLM, SGLang, human review</dd>
  <dt>ML and research</dt><dd>Python, PyTorch, TensorFlow, scikit-learn, XGBoost, sentence-transformers, cross-encoders, statistical modeling</dd>
  <dt>Data platforms</dt><dd>ClickHouse, PostgreSQL, Oracle SQL, MySQL, dbt-core, Airflow, Airbyte, OpenMetadata, ChromaDB, ETL and CDC</dd>
  <dt>Delivery</dt><dd>TypeScript, JavaScript, Node.js, React, Next.js, FastAPI, Docker, Git, Linux, Playwright</dd>
  <dt>BI and operations</dt><dd>Power BI, Power Query, VBA, KPI design, Danaos ERP and PMS, audit-ready reporting</dd>
  <dt>Adversarial review</dt><dd>Solidity, Foundry, invariant testing, threat modeling, access-control analysis, reproducible PoCs</dd>
</dl></section>

<section><h2>Education and credentials</h2><div class="two-col"><div><h3>Universitas Pancasila, Jakarta</h3><p>S.T. in Informatics Engineering</p><p class="small">Yudisium February 2024 / GPA 3.78 of 4.00<br>Thesis: American Sign Language classification with a convolutional neural network<br>National Science Olympiad Physics, 5th place, 2018</p></div><div><ul><li>BNSP Certificate of Competence, Lead Programmer, issued 2022</li><li>AI Strategy and Implementation, Telkom Indonesia Advanced Program</li><li>Type A AI Data Contributor, Empirical LLM Evaluation, T-bench</li><li>Claude Code in Action, Anthropic, 2026</li><li>Master Consultant / AI Engineer, iMerit Technology</li></ul></div></div></section>

<section><h2>Languages</h2><p>Indonesian, native. English, professional working proficiency in technical and business contexts.</p></section>
<section><h2>Evidence convention</h2><p class="note">Public reference means inspectable implementation, not enterprise deployment. <a href="${siteUrl}/cv/Faris_Maulana_Quantitative_Portfolio.pdf">Quantitative methods and evidence boundaries</a> are published separately. Private operational records, personnel records and unredacted credentials are intentionally excluded.</p></section>
<footer>Faris Maulana / Executive CV / Evidence-led edition, 25 November 2026</footer>
</body></html>`

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.pdf({ path: destination.pathname, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true })
} finally {
  await browser.close()
}
console.log(`Generated ${destination.pathname}`)
