import { Request, Response } from 'express';
import { AuthService } from './services/authService';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const result = await authService.login(email, password, role);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials or account role.') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Security: Only allow USER registration publicly
    if (role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot register as ADMIN directly' });
    }

    const result = await authService.registerUser({
      fullName,
      email,
      phone,
      password,
      role: 'USER',
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
