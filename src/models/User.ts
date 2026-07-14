import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password?: string;
  role: 'admin' | 'shopper';
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'shopper'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Remove password from JSON representation
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = model<IUser>('User', UserSchema);
