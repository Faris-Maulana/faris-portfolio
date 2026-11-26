import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ChatMarkdown, getCodeBlockSources } from '@/components/chat/ChatMarkdown'

function render(content: string): string {
  return renderToStaticMarkup(createElement(ChatMarkdown, { content }))
}

describe('assistant Markdown rendering', () => {
  it('renders emphasis and semantic lists without exposing Markdown delimiters', () => {
    const html = render('Text with **bold** and *italic*.\n\n- **Bold**: detail\n- Second item\n\n1. First result\n2. Second result')

    expect(html).toContain('<strong class="chat-markdown-bold">bold</strong>')
    expect(html).toContain('<em class="chat-markdown-italic">italic</em>')
    expect(html).toContain('<strong class="chat-markdown-bold">Bold</strong>: detail')
    expect(html).toContain('<ul class="chat-markdown-list chat-markdown-list-unordered">')
    expect(html).toContain('<ol class="chat-markdown-list chat-markdown-list-ordered">')
    expect(html.match(/<li /g)).toHaveLength(4)
    expect(html).not.toContain('**')
    expect(html).not.toContain('*italic*')
  })

  it('escapes raw HTML instead of instantiating elements or event handlers', () => {
    const html = render('Before <img src=x onerror="alert(1)"> <script>alert("x")</script> after')

    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror="')
  })

  it('renders blockquotes and inline code semantically', () => {
    const html = render('> Use `SELECT *` carefully\n> and **verify the predicate**.')

    expect(html).toContain('<blockquote class="chat-markdown-blockquote">')
    expect(html).toContain('<code class="chat-markdown-inline-code">SELECT *</code>')
    expect(html).toContain('<strong class="chat-markdown-bold">verify the predicate</strong>')
    expect(html).not.toContain('`SELECT *`')
  })

  it('adds lightweight SQL styling and an accessible code copy control', () => {
    const source = "SELECT id, name\nFROM projects\nWHERE status = 'ready'\n-- newest first\nORDER BY created_at DESC"
    const markdown = `\`\`\`sql\n${source}\n\`\`\``
    const html = render(markdown)

    expect(getCodeBlockSources(markdown)).toEqual([source])
    expect(html).toContain('<pre class="chat-code-block">')
    expect(html).toContain('<span class="chat-code-keyword">SELECT</span>')
    expect(html).toContain('<span class="chat-code-keyword">WHERE</span>')
    expect(html).toContain('<span class="chat-code-string">&#x27;ready&#x27;</span>')
    expect(html).toContain('<span class="chat-code-comment">-- newest first</span>')
    expect(html).toContain('aria-label="Copy SQL code"')
    expect(html).toContain('>Copy</span>')
  })

  it('treats an unfinished streamed fence as a code block and retains exact copy source', () => {
    const source = "SELECT *\nFROM projects\nWHERE id = '"
    const markdown = `Partial response\n\n\`\`\`sql\n${source}`
    const html = render(markdown)

    expect(getCodeBlockSources(markdown)).toEqual([source])
    expect(html).toContain('chat-code-language-sql')
    expect(html).not.toContain('```')
    expect(html).toContain('aria-label="Copy SQL code"')
  })

  it('preserves raw code including CRLF and escapes HTML inside fences', () => {
    const source = 'const safe = "<script>alert(1)</script>"\r\nconsole.log(safe)'
    const markdown = `\`\`\`javascript\r\n${source}\r\n\`\`\``
    const html = render(markdown)

    expect(getCodeBlockSources(markdown)).toEqual([source])
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('leaves incomplete inline Markdown as text and renders empty input safely', () => {
    const html = render('Unclosed **bold and `code')

    expect(html).toContain('Unclosed **bold and `code')
    expect(render('')).toBe('<div class="chat-markdown"></div>')
  })
})
