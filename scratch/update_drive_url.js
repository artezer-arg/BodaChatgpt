import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let url = '';
let key = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    url = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    key = line.split('=')[1].trim();
  }
});

if (!url || !key) {
  console.error('Error: Credenciales no encontradas en el archivo .env');
  process.exit(1);
}

const supabase = createClient(url, key);
const driveUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdtFLXyeR6cP8P0IjF5yZUfz4XPs6zUX5tUXf5OJQasBY3AEQ/viewform?usp=header';

console.log(`Actualizando google_drive_url en Supabase a: ${driveUrl}...`);

supabase
  .from('settings')
  .update({ google_drive_url: driveUrl })
  .eq('id', 1)
  .then(({ error }) => {
    if (error) {
      console.error('Error al actualizar en Supabase (Posiblemente aún no creaste la columna):', error.message);
    } else {
      console.log('¡Columna google_drive_url actualizada con éxito en Supabase!');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
