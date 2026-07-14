import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>('Product', ProductSchema);
