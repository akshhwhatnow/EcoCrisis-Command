import { pool } from '../pool';

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: string;
  operator_type: string | null;
  created_at: string;
  status: string;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async createUser(user: Omit<UserRow, 'created_at' | 'status'>): Promise<UserRow> {
    const res = await pool.query(
      `INSERT INTO users (id, full_name, email, phone, password_hash, role, operator_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.id, user.full_name, user.email, user.phone, user.password_hash, user.role, user.operator_type]
    );
    return res.rows[0];
  }
}
