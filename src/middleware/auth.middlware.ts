import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import * as resHandler from "../common/resHandler"

export interface AuthUserPayload {
  id: string;
  username: string;
  role: 'admin' | 'shopper';
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export const isValid = async ( req: AuthRequest, res: Response, next: NextFunction ): Promise<void> => {
  try {
    let token = '';

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return resHandler.unAuthRes(res, [], "Not authorized");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return resHandler.errorRes(res);
    }
    const decoded = jwt.verify(token, secret) as AuthUserPayload;

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return resHandler.unAuthRes(res, [], "Not authorized")
  }
};

export const adminOnly = ( req: AuthRequest, res: Response, next: NextFunction ): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return resHandler.forbiddenRes(res, [], 'Access denied: Admin role required')
  }
};
