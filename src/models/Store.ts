import { Schema, model, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Store = model<IStore>('Store', StoreSchema);
