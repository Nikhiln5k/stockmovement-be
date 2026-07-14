import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import * as resHandler from "../common/resHandler";
import bcrypt from 'bcrypt';

const signToken = (id: string, username: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_dev_key';
  return jwt.sign({ id, username, role }, secret, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return resHandler.badReqRes(res, [], "Please provide username, password and role (Admin or Shopper)")
    }

    if (role !== 'admin' && role !== 'shopper') {
      return resHandler.badReqRes(res, [], "Invalid role. Allowed roles are: Admin, Shopper")
    }

    // Check if user already exists
    const userExists = await User.findOne({ username: username.toLowerCase().trim() });
    if (userExists) {
      return resHandler.badReqRes(res, [], "Username is already taken")
    }

    // hash password
    const salt = 12;
    const hashed = await bcrypt.hash(password, salt)

    const user = await User.create({
      username,
      password: hashed,
      role,
    });

    const token = signToken(user._id.toString(), user.username, user.role);

    return resHandler.createRes(res, {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    }, "User registered successfully")
  } catch (error) {
    return resHandler.errorRes(res)
  }
};

export const login = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return resHandler.badReqRes(res, [], "Please provide both username and password")
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+password');
    if (!user) {
      return resHandler.unAuthRes(res, [], "Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return resHandler.unAuthRes(res, [], "Invalid username or password");
    }

    const token = signToken(user._id.toString(), user.username, user.role);

    return resHandler.successRes(res, {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    }, "User logged in successfully");
  } catch (error) {
    next(error);
  }
};
