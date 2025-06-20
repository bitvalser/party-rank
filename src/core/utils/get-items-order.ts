import { PartyRank } from '../interfaces/party-rank.interface';
import { seededRandom } from './seed-rand-array';

export const getItemsOrder = (partyRank: PartyRank, itemsIds: string[]): string[] => {
  if (partyRank.itemsOrder?.length > 0) {
    return itemsIds.sort((a, b) => {
      const aIdx = partyRank.itemsOrder.indexOf(a);
      const bIdx = partyRank.itemsOrder.indexOf(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }
  return seededRandom({ seed: partyRank._id }).shuffle(itemsIds);
};
