import { Types } from 'mongoose';

export interface ICdnItem {
  userId: Types.ObjectId;
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
