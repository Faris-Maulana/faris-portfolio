const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CERT_DIR = process.argv[2] || '/tmp/cert-download/Certificate'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CERT_MAP = [
  { file: '00QVI00000heUui2AE-DATA_FOR_BREAKFAST_VIRTUAL_Asia_Pacific-13-17042026.pdf', title: 'DATA FOR BREAKFAST Virtual Asia Pacific', issuer: 'DATA FOR BREAKFAST', category: 'Data' },
  { file: 'Belajar Dasar  Data Science.pdf', title: 'Belajar Dasar Data Science', issuer: 'Dicoding Indonesia', category: 'Data' },
  { file: 'Belajar Dasar Google Cloud.pdf', title: 'Belajar Dasar Google Cloud', issuer: 'Dicoding Indonesia', category: 'Engineering' },
  { file: 'Belajar Dasar Structured Query Language (SQL).pdf', title: 'Belajar Dasar SQL', issuer: 'Dicoding Indonesia', category: 'Data' },
  { file: 'Belajar Dasar Visualisasi Data.pdf', title: 'Belajar Dasar Visualisasi Data', issuer: 'Dicoding Indonesia', category: 'Data' },
  { file: 'Businesss Intelligence Fundamental.png', title: 'Business Intelligence Fundamental', issuer: 'Dicoding Indonesia', category: 'Data' },
  { file: 'certificate claude anthropic - Claude 101.pdf', title: 'Claude 101', issuer: 'Anthropic', category: 'AI/ML' },
  { file: 'certificate-8ymfa9qi498a-1774318133-Intoduction to Claude Cowork.pdf', title: 'Introduction to Claude Cowork', issuer: 'Anthropic', category: 'AI/ML' },
  { file: 'certificate-aqfbcjyv6a88-1774254110-claude code in action.pdf', title: 'Claude Code in Action', issuer: 'Anthropic', category: 'AI/ML' },
  { file: 'Lead Programmer BNSP.pdf', title: 'Lead Programmer BNSP', issuer: 'BNSP (Badan Nasional Sertifikasi Profesi)', category: 'Engineering' },
  { file: 'Machine Learning-From Basic to Advanced.jpg', title: 'Machine Learning: From Basic to Advanced', issuer: 'Udemy', category: 'AI/ML' },
  { file: 'Machine Learning, Deep Learning and Bayesian  Learning.jpg', title: 'Machine Learning, Deep Learning and Bayesian Learning', issuer: 'Udemy', category: 'AI/ML' },
  { file: 'Memulai Pemrograman Dengan Python.pdf', title: 'Memulai Pemrograman Dengan Python', issuer: 'Dicoding Indonesia', category: 'Engineering' },
  { file: 'Introduction Data Analytics.pdf', title: 'Introduction to Data Analytics', issuer: 'Dicoding Indonesia', category: 'Data' },
]

async function main() {
  for (const cert of CERT_MAP) {
    const filePath = path.join(CERT_DIR, cert.file)
    if (!fs.existsSync(filePath)) {
      console.error(`✗ File not found: ${cert.file}`)
      continue
    }

    const ext = path.extname(cert.file).toLowerCase()
    const contentType = ext === '.png' ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
      : 'application/pdf'

    const safeName = cert.file.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `certificates/${Date.now()}-${safeName}`

    const fileBuffer = fs.readFileSync(filePath)

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(storagePath, fileBuffer, { contentType, upsert: true })

    if (uploadError) {
      console.error(`✗ Upload failed for ${cert.file}: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(storagePath)

    const { error: upsertError } = await supabase
      .from('certificates')
      .upsert({
        title: cert.title,
        issuer: cert.issuer,
        category: cert.category,
        image_url: publicUrl,
        verify_url: publicUrl,
        featured: cert.category === 'AI/ML' || cert.category === 'Engineering',
        sort_order: 10,
      }, { onConflict: 'title', ignoreDuplicates: false })

    if (upsertError) {
      console.error(`✗ DB error for ${cert.title}: ${upsertError.message}`)
    } else {
      console.log(`✓ ${cert.title}`)
    }
  }

  console.log('\nAll certificates uploaded!')
}

main().catch(console.error)
