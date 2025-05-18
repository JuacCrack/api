import { Database } from 'bun:sqlite'
import { config } from 'dotenv'
import { join } from 'path'

// Carga variables de entorno solo si estamos en desarrollo
if (process.env.NODE_ENV !== 'production') {
  config({ path: join(import.meta.dir, '../../keys.env') })
}

const dbname = process.env.DB_NAME

if (!dbname) {
  throw new Error('Falta la variable de entorno DB_NAME para la base de datos SQLite')
}

const db = new Database(`${dbname}.db`, { create: true })

export function connectDB() {
  return db
}
