export enum UserRole {
  Creator = 'creator',
  Regular = 'regular',
}

export interface AppUser {
  _id: string;
  photoURL: string;
  displayName: string;
  role: UserRole;
}
