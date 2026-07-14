import { Request, Response } from 'express';
import { Product } from '../models/Product';
import * as resHandler from '../common/resHandler';

export const getProducts = async ( _req: Request, res: Response ): Promise<void> => {
  try {
    const products = await Product.find({}).sort({ name: 1 });
    return resHandler.successRes(res, products, "Products retrieved successfully");
  } catch (error) {
    return resHandler.errorRes(res);
  }
};

export const createProduct = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const { name, sku } = req.body;

    if (!name || !sku) {
      return resHandler.badReqRes(res, [], 'Product name and unique SKU are required');
    }

    const formattedSku = sku.toUpperCase().trim();

    // Although the index will enforce this, an early check prevents Mongoose throw
    const existing = await Product.findOne({ sku: formattedSku });
    if (existing) {
      return resHandler.badReqRes(res, [], `Product with SKU '${formattedSku}' already exists`);
    }

    const product = await Product.create({
      name: name.trim(),
      sku: formattedSku,
    });

    return resHandler.createRes(res, product, "Product created successfully");
  } catch (error) {
    return resHandler.errorRes(res);
  }
};
