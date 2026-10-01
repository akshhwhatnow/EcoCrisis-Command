import { pool } from './pool';
import bcrypt from 'bcryptjs';

export async function seedUsers() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  await pool.query(`
    INSERT INTO users (id, full_name, email, phone, password_hash, role, operator_type)
    VALUES 
      ('U-1', 'John Smith', 'john@email.com', '555-0101', $1, 'USER', NULL),
      ('U-2', 'Admin One', 'admin@email.com', '555-0102', $1, 'ADMIN', 'Crisis Operations Administrator')
    ON CONFLICT (email) DO NOTHING;
  `, [hash]);
}

seedUsers().then(() => process.exit(0)).catch(console.error);