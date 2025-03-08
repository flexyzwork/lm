// import type { User } from "@packages/common" with { "resolution-mode": "import" };
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare module "express" {
  export interface Request {
    user?: User | JwtPayload;
  }
}

export interface User extends JwtPayload {
  userId: string;
  email: string | null;
  role: "USER" | "INSTRUCTOR";
  provider: "EMAIL" | "GOOGLE" | "GITHUB";
  providerId: string | null;
  name: string | null;
  picture: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // JWT 서명 키

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized - No Token Provided' });
    return; // ✅ `return` 추가
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    console.log('decoded', decoded);
    req.user = decoded; // ✅ 타입 오류 해결
    next(); // ✅ 다음 미들웨어로 이동
  } catch (error) {
    res.status(403).json({ message: 'Forbidden - Invalid Token' });
    return; // ✅ `return` 추가
  }
};
