import { useMemo } from 'react';

import { RankItem } from '../../../core/interfaces/rank-item.interface';
import { UserRank } from '../../../core/interfaces/user-rank.interface';
import { getUserRanksFromResult } from '../../../core/utils/get-user-ranks';

export const useSortedPartyItems = (
  partyItems: RankItem[],
  dbUsersRank: UserRank[],
  members: string[],
): (RankItem & { favoriteCount: number; grade: number; totalScore: number; userLikesIds: string[] })[] => {
  return useMemo(() => {
    if (partyItems?.length > 0 && dbUsersRank?.length > 0) {
      const hasMembers = members?.length > 0;
      const usersRank = dbUsersRank.filter((rank) => !hasMembers || members.includes(rank.uid));
      const rankBy: {
        favorites: Record<string, number>;
        favoritesUsers: Record<string, string[]>;
        grades: Record<string, number[]>;
      } = {
        favorites: {},
        grades: {},
        favoritesUsers: {},
      };
      usersRank.forEach((rank) => {
        const restRank = getUserRanksFromResult(rank);
        if (rank.favoriteId) {
          rankBy.favorites[rank.favoriteId] = (rankBy.favorites[rank.favoriteId] ?? 0) + 1;
          rankBy.favoritesUsers[rank.favoriteId] = [...(rankBy.favoritesUsers[rank.favoriteId] || []), rank.uid];
        }
        Object.entries(restRank).forEach(([rankId, { value }]) => {
          rankBy.grades[rankId] = [...(rankBy.grades[rankId] || []), value];
        });
      });
      return partyItems
        .map((item) => ({
          ...item,
          favoriteCount: rankBy.favorites[item.id] ?? 0,
          userLikesIds: rankBy.favoritesUsers[item.id],
          totalScore:
            (rankBy.grades[item.id] || []).reduce((acc, val) => acc + val, 0) + (rankBy.favorites[item.id] ?? 0) * 0.5,
          grade: rankBy.grades[item.id]
            ? rankBy.grades[item.id].reduce((acc, val) => acc + val, 0) / rankBy.grades[item.id].length
            : null,
        }))
        .sort((rankA, rankB) => {
          const rank = rankB.totalScore - rankA.totalScore;
          return rank;
        });
    }
    return [];
  }, [members, dbUsersRank, partyItems]);
};
