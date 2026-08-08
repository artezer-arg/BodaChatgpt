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

const email = 'admin@boda.com';
const password = 'PamelaYNestor2026';

console.log(`Registrando usuario administrador: ${email}...`);

supabase.auth.signUp({
  email,
  password
}).then(({ data, error }) => {
  if (error) {
    console.error('Error al registrar usuario:', error.message);
  } else {
    console.log('¡Usuario registrado con éxito!');
    console.log(`Email: ${email}`);
    console.log(`Contraseña: ${password}`);
    console.log('\n--- PASO IMPORTANTE EN SUPABASE ---');
    console.log('1. Ve a tu consola de Supabase > Authentication > Users.');
    console.log('2. Verás al usuario admin@boda.com con el estado "Waiting for verification".');
    console.log('3. Haz clic en los tres puntos (...) a la derecha del usuario y selecciona "Confirm user".');
    console.log('¡Esto activará tu cuenta de inmediato!');
  }
}).catch(err => {
  console.error('Error:', err);
});
