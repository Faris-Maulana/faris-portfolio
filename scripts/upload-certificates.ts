// Certificate upload script
// Usage: npx ts-node scripts/upload-certificates.ts <path-to-images-folder>
// Uploads images to Supabase Storage and inserts records to public.certificates

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const folder = process.argv[2]
  if (!folder) {
    console.error('Usage: npx ts-node scripts/upload-certificates.ts <path-to-images-folder>')
    process.exit(1)
  }

  const files = fs.readdirSync(folder).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  console.log(`Found ${files.length} certificate images`)

  for (const file of files) {
    const filePath = path.join(folder, file)
    const buffer = fs.readFileSync(filePath)
    const fileName = `certificates/${Date.now()}-${file}`

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, buffer, {
        contentType: `image/${path.extname(file).slice(1)}`,
        upsert: true,
      })

    if (uploadError) {
      console.error(`Failed to upload ${file}:`, uploadError)
      continue
    }

    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName)

    const title = path.basename(file, path.extname(file)).replace(/[-_]/g, ' ')

    const { error: insertError } = await supabase
      .from('certificates')
      .insert({
        title,
        issuer: 'Unknown',
        image_url: urlData?.publicUrl || null,
        category: 'Other',
      })

    if (insertError) {
      console.error(`Failed to insert record for ${file}:`, insertError)
    } else {
      console.log(`✓ Uploaded: ${file} → ${title}`)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
