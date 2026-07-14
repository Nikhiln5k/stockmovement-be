import { Request, Response } from 'express';
import { Store } from '../models/Store';
import * as resHandler from '../common/resHandler';

export const getStores = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const stores = await Store.find({}).sort({ name: 1 });
    return resHandler.successRes(res, stores, "Stores retrieved successfully");
  } catch (error) {
    return resHandler.errorRes(res);
  }
};

export const createStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      return resHandler.badReqRes(res, [], 'Store name is required');
    }

    const storeName = name.trim();

    // Check if store already exists
    const existing = await Store.findOne({ name: storeName });
    if (existing) {
      return resHandler.badReqRes(res, [], `Store with name '${storeName}' already exists`);
    }

    const store = await Store.create({
      name: storeName,
    });

    return resHandler.createRes(res, store, "Store created successfully");
  } catch (error) {
    return resHandler.errorRes(res);
  }
};
