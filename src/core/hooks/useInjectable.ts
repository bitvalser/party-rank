import { interfaces } from 'inversify';
import { useContext, useMemo } from 'react';

import { InversifyContext } from '../../inversify.config';

export const useInjectable = <T extends unknown = any>(type: interfaces.ServiceIdentifier<T>) => {
  const container = useContext(InversifyContext);
  return useMemo(() => container.get<T>(type), [container, type]);
};
