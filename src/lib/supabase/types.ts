export interface Certificate {
  id: string
  title: string
  issuer: string
  issued_date: string | null
  category: 'AI/ML' | 'Security' | 'Engineering' | 'Data' | 'Leadership' | 'Other'
  image_url: string | null
  verify_url: string | null
  featured: boolean
  sort_order: number
}

export interface Project {
  id: string
  title: string
  tagline: string
  description: string
  stack: string[]
  category: string
  repo_url: string | null
  demo_url: string | null
  image_url: string | null
  featured: boolean
  year: number
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  tags: string[]
  published_at: string
  read_time_min: number
  cover_url: string | null
}

export interface ContactMessage {
  name: string
  email: string
  subject?: string
  message: string
  source?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
}
