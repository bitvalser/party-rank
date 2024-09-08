import { Schema, model } from 'mongoose';

import { IUser, UserRole } from '../types/user.type';

export const userScheme = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Regular,
    },
    displayName: String,
    photoURL: String,
  },
  { collection: 'users' },
);

export const UserModel = model('User', userScheme);
