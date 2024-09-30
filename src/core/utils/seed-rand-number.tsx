import { cyrb128, sfc32 } from './math';

export const seedRandNumber = (seed: string): number => sfc32(...cyrb128(seed))();
