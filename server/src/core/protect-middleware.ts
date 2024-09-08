import { UserRole } from '../types';
import { ensureRole } from './ensure-role';
import { ensureToken } from './ensure-token';

export const protect = ({ role }: { role?: UserRole[] } = {}): any[] => [ensureToken, ensureRole(role)];
