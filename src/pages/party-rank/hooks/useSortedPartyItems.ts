import { useMemo } from 'react';

import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { UserRank } from '../../../core/interfaces/user-rank.interface';

export const useSortedPartyItems = (
  partyItems: RankItem[],
  usersRank: UserRank[],
): (RankItem & { favoriteCount: number; grade: number })[] => {
  return useMemo(() => {
    if (partyItems?.length > 0 && usersRank?.length > 0) {
      const rankBy: {
        favorites: Record<string, number>;
        grades: Record<string, number[]>;
      } = {
        favorites: {},
        grades: {},
      };
      usersRank.forEach((rank) => {
        const { favoriteId, uid, author, ...restRank } = rank;
        if (favoriteId) {
          rankBy.favorites[favoriteId] = (rankBy.favorites[favoriteId] ?? 0) + 1;
        }
        Object.entries(restRank).forEach(([rankId, { value }]) => {
          rankBy.grades[rankId] = [...(rankBy.grades[rankId] || []), value];
        });
      });
      return partyItems
        .map((item) => ({
          ...item,
          favoriteCount: rankBy.favorites[item.id] ?? 0,
          grade: rankBy.grades[item.id]
            ? rankBy.grades[item.id].reduce((acc, val) => acc + val) / rankBy.grades[item.id].length
            : null,
        }))
        .sort((rankA, rankB) => rankB.grade - rankA.grade);
    }
    return [];
  }, [partyItems, usersRank]);
};
