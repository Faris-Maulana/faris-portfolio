const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const CERT_DIR = process.argv[2] || '/tmp/cert-download/Certificate'

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

async function upload() {
  for (const cert of CERT_MAP) {
    const filePath = path.join(CERT_DIR, cert.file)
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${cert.file}`)
      continue
    }

    const ext = path.extname(cert.file)
    const contentType = ext === '.png' ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
      : 'application/pdf'

    const storagePath = `certificates/${Date.now()}-${cert.file.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const fileBuffer = fs.readFileSync(filePath)

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(storagePath, fileBuffer, { contentType, upsert: true })

    if (uploadError) {
      console.error(`Upload failed for ${cert.file}:`, uploadError.message)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(storagePath)

    const { error: updateError } = await supabase
      .from('certificates')
      .update({ image_url: publicUrl })
      .eq('title', cert.title)

    if (updateError) {
      console.error(`DB update failed for ${cert.title}:`, updateError.message)
    } else {
      console.log(`✓ ${cert.title} → ${publicUrl}`)
    }
  }

  console.log('\nDone! All certificates uploaded.')
}

upload().catch(console.error)
