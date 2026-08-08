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
const spotifyUrl = 'https://open.spotify.com/playlist/6v4DSTXLcXvtaqdUaNyQtI?si=100f201b2eb04928';

console.log(`Actualizando spotify_playlist_url en Supabase a: ${spotifyUrl}...`);

// First try to update (assuming column exists or will be created by ALTER statement later)
supabase
  .from('settings')
  .update({ spotify_playlist_url: spotifyUrl })
  .eq('id', 1)
  .then(({ error }) => {
    if (error) {
      console.log('Aviso: La columna spotify_playlist_url no existe aún en la base de datos (se creará con el ALTER TABLE).');
    } else {
      console.log('¡Columna spotify_playlist_url actualizada con éxito en Supabase!');
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
