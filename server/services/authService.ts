import { UserRepository, UserRow } from '../db/repositories/userRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eco-crisis-super-secret-key';

export class AuthService {
  private userRepository = new UserRepository();

  async registerUser(data: any): Promise<{ user: Partial<UserRow>, token: string }> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);

    const newUser = await this.userRepository.createUser({
      id: `U-${Date.now()}`,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || '',
      password_hash: hash,
      role: data.role || 'USER',
      operator_type: data.operatorType || null,
    });

    const token = this.generateToken(newUser);
    return { user: this.sanitizeUser(newUser), token };
  }

  async login(email: string, password: string, requestedRole: string): Promise<{ user: Partial<UserRow>, token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials or account role.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials or account role.');
    }

    if (user.role !== requestedRole) {
      throw new Error('Invalid credentials or account role.');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  private generateToken(user: UserRow): string {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  private sanitizeUser(user: UserRow): Partial<UserRow> {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
