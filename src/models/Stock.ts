import { Schema, model, Document } from 'mongoose';

export interface IStock extends Document {
  product: Schema.Types.ObjectId;
  store: Schema.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Stock quantity cannot be less than zero'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique combinations of product and store at the database level
StockSchema.index({ product: 1, store: 1 }, { unique: true });

export const Stock = model<IStock>('Stock', StockSchema);
