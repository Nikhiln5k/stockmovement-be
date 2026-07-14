import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Stock } from '../models/Stock';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import * as resHandler from '../common/resHandler';

export const getStocks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threshold } = req.query;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    
    if (threshold !== undefined) {
      const limit = parseInt(threshold as string, 10);
      if (isNaN(limit) || limit < 0) {
        return resHandler.badReqRes(res, [], 'Threshold must be a non-negative integer');
      }
      filter.quantity = { $lte: limit };
    }

    const stocks = await Stock.find(filter)
      .populate('product', 'name sku')
      .populate('store', 'name')
      .sort({ updatedAt: -1 });

    return resHandler.successRes(res, stocks, 'Stocks retrieved successfully');
  } catch (error) {
    return resHandler.errorRes(res);
  }
};

export const adjustStock = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const { productId, storeId, quantityChange } = req.body;

    // Validate request inputs
    if (!productId || !storeId || quantityChange === undefined) {
      return resHandler.badReqRes(res, [], 'Please provide productId, storeId, and quantityChange');
    }

    if (typeof quantityChange !== 'number' || isNaN(quantityChange)) {
      return resHandler.badReqRes(res, [], 'Quantity change must be a valid number');
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return resHandler.badReqRes(res, [], 'Invalid product ID');
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return resHandler.badReqRes(res, [], 'Invalid store ID');
    }

    // Verify product and store exist
    const product = await Product.findById(productId);
    if (!product) {
      return resHandler.notFoundRes(res, [], 'Product not found');
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return resHandler.notFoundRes(res, [], 'Store not found');
    }

    let updatedStock;

    if (quantityChange >= 0) {
      // If adding stock, upsert if the record does not exist yet
      updatedStock = await Stock.findOneAndUpdate(
        { product: productId, store: storeId },
        { $inc: { quantity: quantityChange } },
        { new: true, upsert: true, runValidators: true }
      );
    } else {
      // If subtracting stock, we filter to ensure that the document exists
      // and has a quantity greater than or equal to the absolute value of the change
      updatedStock = await Stock.findOneAndUpdate(
        {
          product: productId,
          store: storeId,
          quantity: { $gte: -quantityChange },
        },
        { $inc: { quantity: quantityChange } },
        { new: true, runValidators: true }
      );

      if (!updatedStock) {
        return resHandler.badReqRes(
          res,
          [],
          `Insufficient stock. Cannot decrease stock by ${-quantityChange} when current stock is lower or does not exist.`
        );
      }
    }

    // Return populated record for convenience on frontend
    const populated = await Stock.findById(updatedStock._id)
      .populate('product', 'name sku')
      .populate('store', 'name');

    return resHandler.successRes(res, populated, 'Stock adjusted successfully');
  } catch (error) {
    return resHandler.errorRes(res);
  }
};

export const transferStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  let session: mongoose.ClientSession | null = null;
  try {
    const { productId, sourceStoreId, targetStoreId, quantity } = req.body;

    // Validate payload values
    if (!productId || !sourceStoreId || !targetStoreId || quantity === undefined) {
      return resHandler.badReqRes(res, [], 'Please provide productId, sourceStoreId, targetStoreId, and quantity');
    }

    if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
      return resHandler.badReqRes(res, [], 'Transfer quantity must be a positive number');
    }

    if (sourceStoreId === targetStoreId) {
      return resHandler.badReqRes(res, [], 'Source store and target store must be different');
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return resHandler.badReqRes(res, [], 'Invalid product ID');
    }
    if (!mongoose.Types.ObjectId.isValid(sourceStoreId)) {
      return resHandler.badReqRes(res, [], 'Invalid source store ID');
    }
    if (!mongoose.Types.ObjectId.isValid(targetStoreId)) {
      return resHandler.badReqRes(res, [], 'Invalid target store ID');
    }

    // Validate document existence
    const product = await Product.findById(productId);
    if (!product) {
      return resHandler.notFoundRes(res, [], 'Product not found');
    }

    const sourceStore = await Store.findById(sourceStoreId);
    if (!sourceStore) {
      return resHandler.notFoundRes(res, [], 'Source store not found');
    }

    const targetStore = await Store.findById(targetStoreId);
    if (!targetStore) {
      return resHandler.notFoundRes(res, [], 'Target store not found');
    }

    // Check if source stock has enough units before entering transaction (performance optimization + early fail)
    const currentSource = await Stock.findOne({ product: productId, store: sourceStoreId });
    if (!currentSource || currentSource.quantity < quantity) {
      return resHandler.badReqRes(
        res,
        [],
        `Insufficient stock at source store. Available: ${currentSource ? currentSource.quantity : 0}, Required: ${quantity}`
      );
    }

    // Initialize session for atomic multi-document transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Decrement source stock. Filter query ensures double-validation against concurrency.
    const decrementedStock = await Stock.findOneAndUpdate(
      {
        product: productId,
        store: sourceStoreId,
        quantity: { $gte: quantity },
      },
      { $inc: { quantity: -quantity } },
      { new: true, session }
    );

    if (!decrementedStock) {
      throw new Error('INSUFFICIENT_STOCK_CONCURRENT');
    }

    // 2. Increment target stock. If no stock document exists, create it (upsert).
    const incrementedStock = await Stock.findOneAndUpdate(
      { product: productId, store: targetStoreId },
      { $inc: { quantity: quantity } },
      { new: true, upsert: true, session }
    );

    // Commit changes
    await session.commitTransaction();
    session.endSession();
    session = null;

    // Fetch the updated states to send back
    const updatedSource = await Stock.findById(decrementedStock._id)
      .populate('product', 'name sku')
      .populate('store', 'name');

    const updatedTarget = await Stock.findById(incrementedStock._id)
      .populate('product', 'name sku')
      .populate('store', 'name');

    return resHandler.successRes(res, {
      source: updatedSource,
      target: updatedTarget,
    }, 'Stock transfer completed successfully');
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    
    const err = error as Error;
    if (err.message === 'INSUFFICIENT_STOCK_CONCURRENT') {
      return resHandler.badReqRes(res, [], 'Insufficient stock at source store (concurrency conflict).');
    }

    // Handle transaction-related errors (e.g. running on standalone mongo instead of replica set)
    if (err.message.includes('replica set') || err.message.includes('transaction')) {
      return resHandler.badReqRes(res, [], 'Database transaction error. Ensure MongoDB is running in replica set mode to support transactions.');
    }

    return resHandler.errorRes(res);
  }
};
