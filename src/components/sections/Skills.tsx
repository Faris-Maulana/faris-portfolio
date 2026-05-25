'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph = dynamic(() => import('@/components/ui/ForceGraph'), { ssr: false })

const SKILL_GROUPS = [
  { category: 'LLM & AI', color: '#00f5ff', items: ['LLM Fine-Tuning', 'RAG', 'LangChain', 'LlamaIndex', 'Vector DBs', 'HuggingFace', 'Ollama', 'OpenAI API'] },
  { category: 'Data Engineering', color: '#39ff14', items: ['Apache Kafka', 'Apache Spark', 'Airflow', 'dbt', 'PostgreSQL', 'MySQL', 'BigQuery', 'Snowflake'] },
  { category: 'Backend & API', color: '#bf5fff', items: ['Python', 'TypeScript', 'Go', 'FastAPI', 'Express', 'Next.js', 'GraphQL', 'WebSockets'] },
  { category: 'Smart Contract Security', color: '#ff3e3e', items: ['Solidity', 'Foundry', 'Slither', 'Echidna', 'CTF', 'Auditing'] },
  { category: 'BI & Visualization', color: '#ffb800', items: ['Tableau', 'Looker', 'Metabase', 'Apache Superset', 'Power BI'] },
  { category: 'Infrastructure', color: '#00c8d4', items: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'CI/CD', 'GitHub Actions'] },
]

export function Skills() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="skills" className="section" ref={ref}>
      <div className="container">
        <div
          className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="section-heading-tag">{'// NODES'}</span>
          <h2 className="section-heading gradient-text">Neural Constellation</h2>
          <div className="fiber-line mt-4" />
          <p className="text-text-secondary text-xs md:text-sm font-mono mt-4 max-w-xl">
            A force-directed map of skills. Drag nodes to explore connections. Each cluster represents a competency domain.
          </p>
        </div>

        <div
            className={`mt-10 rounded-xl overflow-hidden border border-border-glass transition-all duration-700 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ height: 480 }}
          >
            <ForceGraph groups={SKILL_GROUPS} />
          </div>
      </div>
    </section>
  )
}
