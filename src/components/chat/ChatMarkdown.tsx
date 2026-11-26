'use client'

import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

interface ChatMarkdownProps {
  readonly content: string
}

type MarkdownBlock =
  | { readonly type: 'paragraph'; readonly id: number; readonly text: string }
  | { readonly type: 'code'; readonly id: number; readonly language: string; readonly source: string }
  | { readonly type: 'quote'; readonly id: number; readonly text: string }
  | { readonly type: 'list'; readonly id: number; readonly ordered: boolean; readonly items: readonly { readonly id: number; readonly value?: number; readonly text: string }[] }

type CopyResult = { readonly source: string; readonly status: 'copied' | 'error' }

const FENCE_PATTERN = /^ {0,3}```([A-Za-z0-9_+-]*)[^`]*$/
const CLOSING_FENCE_PATTERN = /^ {0,3}```\s*$/
const UNORDERED_ITEM_PATTERN = /^ {0,3}[-+*]\s+(.+)$/
const ORDERED_ITEM_PATTERN = /^ {0,3}(\d+)[.)]\s+(.+)$/
const QUOTE_PATTERN = /^ {0,3}>\s?(.*)$/

const SQL_KEYWORDS = new Set([
  'ALL', 'ALTER', 'ANALYZE', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CAST',
  'CONSTRAINT', 'CREATE', 'CROSS', 'DEFAULT', 'DELETE', 'DESC', 'DISTINCT', 'DROP',
  'ELSE', 'END', 'EXISTS', 'EXPLAIN', 'FOREIGN', 'FROM', 'FULL', 'GROUP', 'HAVING',
  'ILIKE', 'IN', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN', 'KEY', 'LEFT', 'LIKE',
  'LIMIT', 'NOT', 'NULL', 'OFFSET', 'ON', 'OR', 'ORDER', 'OUTER', 'OVER', 'PARTITION',
  'PRIMARY', 'REFERENCES', 'RETURNING', 'RIGHT', 'SELECT', 'SET', 'TABLE', 'THEN',
  'UNION', 'UPDATE', 'VALUES', 'WHEN', 'WHERE', 'WITH',
])

const SQL_HIGHLIGHT_PATTERN = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*'|"(?:""|[^"])*")|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b/g

function isBlockStart(line: string): boolean {
  return FENCE_PATTERN.test(line) || UNORDERED_ITEM_PATTERN.test(line) || ORDERED_ITEM_PATTERN.test(line) || QUOTE_PATTERN.test(line)
}

function parseBlocks(content: string): MarkdownBlock[] {
  const lines = content.split('\n')
  const blocks: MarkdownBlock[] = []
  let cursor = 0

  while (cursor < lines.length) {
    const line = lines[cursor]
    if (!line.trim()) {
      cursor += 1
      continue
    }

    const fence = line.match(FENCE_PATTERN)
    if (fence) {
      let end = cursor + 1
      while (end < lines.length && !CLOSING_FENCE_PATTERN.test(lines[end])) end += 1
      const sourceLines = lines.slice(cursor + 1, end)
      if (end < lines.length && sourceLines.at(-1)?.endsWith('\r')) {
        sourceLines[sourceLines.length - 1] = sourceLines[sourceLines.length - 1].slice(0, -1)
      }
      blocks.push({
        type: 'code',
        id: cursor,
        language: fence[1].toLowerCase(),
        source: sourceLines.join('\n'),
      })
      cursor = end < lines.length ? end + 1 : end
      continue
    }

    const unorderedItem = line.match(UNORDERED_ITEM_PATTERN)
    const orderedItem = line.match(ORDERED_ITEM_PATTERN)
    if (unorderedItem || orderedItem) {
      const ordered = Boolean(orderedItem)
      const items: { id: number; value?: number; text: string }[] = []
      let end = cursor
      while (end < lines.length) {
        const match = lines[end].match(ordered ? ORDERED_ITEM_PATTERN : UNORDERED_ITEM_PATTERN)
        if (!match) break
        items.push(ordered
          ? { id: end, value: Number(match[1]), text: match[2] }
          : { id: end, text: match[1] })
        end += 1
      }
      blocks.push({ type: 'list', id: cursor, ordered, items })
      cursor = end
      continue
    }

    if (QUOTE_PATTERN.test(line)) {
      const quotedLines: string[] = []
      let end = cursor
      while (end < lines.length) {
        const match = lines[end].match(QUOTE_PATTERN)
        if (!match) break
        quotedLines.push(match[1])
        end += 1
      }
      blocks.push({ type: 'quote', id: cursor, text: quotedLines.join('\n') })
      cursor = end
      continue
    }

    let end = cursor + 1
    while (end < lines.length && lines[end].trim() && !isBlockStart(lines[end])) end += 1
    blocks.push({ type: 'paragraph', id: cursor, text: lines.slice(cursor, end).join('\n') })
    cursor = end
  }

  return blocks
}

export function getCodeBlockSources(content: string): string[] {
  return parseBlocks(content).flatMap(block => block.type === 'code' ? [block.source] : [])
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0

  while (cursor < text.length) {
    if (text[cursor] === '`') {
      const end = text.indexOf('`', cursor + 1)
      if (end > cursor + 1) {
        nodes.push(<code key={`code-${cursor}`} className="chat-markdown-inline-code">{text.slice(cursor + 1, end)}</code>)
        cursor = end + 1
        continue
      }
    }

    if (text.startsWith('**', cursor)) {
      const end = text.indexOf('**', cursor + 2)
      if (end > cursor + 2) {
        nodes.push(<strong key={`strong-${cursor}`} className="chat-markdown-bold">{renderInline(text.slice(cursor + 2, end))}</strong>)
        cursor = end + 2
        continue
      }
    }

    if (text[cursor] === '*' && !text.startsWith('**', cursor)) {
      const end = text.indexOf('*', cursor + 1)
      if (end > cursor + 1) {
        nodes.push(<em key={`em-${cursor}`} className="chat-markdown-italic">{renderInline(text.slice(cursor + 1, end))}</em>)
        cursor = end + 1
        continue
      }
    }

    let end = cursor + 1
    while (end < text.length && text[end] !== '`' && text[end] !== '*') end += 1
    nodes.push(text.slice(cursor, end))
    cursor = end
  }

  return nodes
}

function highlightSQL(source: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const match of source.matchAll(SQL_HIGHLIGHT_PATTERN)) {
    const index = match.index
    if (index > cursor) nodes.push(source.slice(cursor, index))

    let className = ''
    if (match[1]) className = 'chat-code-comment'
    else if (match[2]) className = 'chat-code-string'
    else if (/^\d/.test(match[0])) className = 'chat-code-number'
    else if (SQL_KEYWORDS.has(match[0].toUpperCase())) className = 'chat-code-keyword'

    if (className) nodes.push(<span key={`token-${index}`} className={className}>{match[0]}</span>)
    else nodes.push(match[0])
    cursor = index + match[0].length
  }

  if (cursor < source.length) nodes.push(source.slice(cursor))
  return nodes
}

function CodeBlock({ language, source }: { readonly language: string; readonly source: string }) {
  const [result, setResult] = useState<CopyResult | null>(null)
  const status = result?.source === source ? result.status : 'idle'
  const copyLabel = language ? `Copy ${language.toUpperCase()} code` : 'Copy code'
  const statusLabel = status === 'copied' ? 'Copied' : status === 'error' ? 'Clipboard unavailable. Select the code to copy it.' : 'Copy'

  const copyCode = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(source)
      setResult({ source, status: 'copied' })
    } catch {
      setResult({ source, status: 'error' })
    }
  }

  return (
    <figure className="chat-code">
      <figcaption className="chat-code-caption">
        <span className="chat-code-language">{language ? language.toUpperCase() : 'Code'}</span>
        <button type="button" className="chat-code-copy" onClick={() => void copyCode()} aria-label={copyLabel} title={copyLabel}>
          {status === 'copied' ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          <span className="chat-code-copy-label" role="status" aria-live="polite">{statusLabel}</span>
        </button>
      </figcaption>
      <pre className="chat-code-block"><code className={`chat-code-source${language ? ` chat-code-language-${language}` : ''}`}>{language === 'sql' ? highlightSQL(source) : source}</code></pre>
    </figure>
  )
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  const blocks = parseBlocks(content)

  return (
    <div className="chat-markdown">
      {blocks.map(block => {
        if (block.type === 'code') return <CodeBlock key={block.id} language={block.language} source={block.source} />
        if (block.type === 'quote') return <blockquote key={block.id} className="chat-markdown-blockquote"><p>{renderInline(block.text)}</p></blockquote>
        if (block.type === 'list') {
          const items = block.items.map(item => <li key={item.id} className="chat-markdown-list-item" value={item.value}>{renderInline(item.text)}</li>)
          return block.ordered
            ? <ol key={block.id} className="chat-markdown-list chat-markdown-list-ordered">{items}</ol>
            : <ul key={block.id} className="chat-markdown-list chat-markdown-list-unordered">{items}</ul>
        }
        return <p key={block.id} className="chat-markdown-paragraph">{renderInline(block.text)}</p>
      })}
    </div>
  )
}
