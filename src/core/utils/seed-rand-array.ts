import { cyrb128, mulberry32 } from './math';

export const seededRandom = ({ seed = 'apples' } = {}): {
  rnd: (lo: number, hi?: number, defaultHi?: number) => number;
  rndInt: (lo: number, hi?: number) => number;
  shuffle: <T extends any[]>(array: T) => T;
} => {
  const rng = mulberry32(cyrb128(seed)[0]);

  const rnd = (lo: number, hi?: number, defaultHi = 1) => {
    if (hi === undefined) {
      hi = lo === undefined ? defaultHi : lo;
      lo = 0;
    }

    return rng() * (hi - lo) + lo;
  };

  const rndInt = (lo: number, hi?: number): number => Math.floor(rnd(lo, hi, 2));

  const shuffle = ((array: any[]) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = rndInt(i + 1);
      const x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }) as never;

  return { rnd, rndInt, shuffle };
};
