export enum UserRole {
  Regular = 'regular',
  Creator = 'creator',
}

export interface IUser {
  photoURL: string;
  displayName: string;
  role: UserRole;
}
