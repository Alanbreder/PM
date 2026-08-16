import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'product-os-sip-secret-key-2026';

export interface TokenPayload {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export function createLocalToken(payload: TokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
  const iat = Math.floor(Date.now() / 1000);
  
  const body = Buffer.from(JSON.stringify({
    ...payload,
    iat,
    exp,
  })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

export function verifyLocalToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}
