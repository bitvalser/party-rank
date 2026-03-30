import { Types } from 'mongoose';

export interface ICdnItem {
  userId: Types.ObjectId;
  uploadLimit?: number;
  assets: Map<
    string,
    {
      path: string;
      created: Date;
      name: string;
      id: string;
      url: string;
    }
  >;
}
