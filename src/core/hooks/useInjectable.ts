import { useContext, useMemo } from 'react';

import { InversifyContext } from '../../inversify.config';
import { TypeMap } from '../services/types';

export const useInjectable = <T extends keyof TypeMap, M = TypeMap[T]>(type: T): M => {
  const container = useContext(InversifyContext);
  return useMemo(() => container.get<M>(type), [container, type]);
};
