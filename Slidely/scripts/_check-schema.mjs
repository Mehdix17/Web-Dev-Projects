import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...parts] = line.split('=');
  if (key) envVars[key.trim()] = parts.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const sql = neon(envVars.DATABASE_URL);

async function checkSchema() {
  try {
    // Get table columns
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'works' 
      ORDER BY ordinal_position
    `;
    
    console.log('\ní³‹ Works Table Schema:\n');
    result.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} ${col.data_type.padEnd(15)} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    // Show sample record
    console.log('\ní³Š Sample Record:");
    const sample = await sql`SELECT * FROM works LIMIT 1`;
    if (sample.length > 0) {
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
