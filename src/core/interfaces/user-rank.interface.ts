export interface UserRank {
  favoriteId?: string;
  [key: string]: { value: number } | any;
}
