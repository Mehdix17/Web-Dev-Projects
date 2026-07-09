import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...parts] = line.split('=');
  if (key) envVars[key.trim()] = parts.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const sql = neon(envVars.DATABASE_URL);

async function check() {
  try {
    const works = await sql`SELECT slug, title, pdf_url FROM works LIMIT 3`;
    console.log('Sample works with pdf_url:');
    works.forEach(w => {
      console.log(`  ${w.slug}: pdf_url="${w.pdf_url}"`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
