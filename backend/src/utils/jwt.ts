import jwt from 'jsonwebtoken';

export function generateToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30m',
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
}