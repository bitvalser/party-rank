import { PartyRank } from '../interfaces/party-rank.interface';
import { seededRandom } from './seed-rand-array';

export const getItemsOrder = (partyRank: PartyRank, itemsIds: string[]): string[] => {
  if (partyRank.itemsOrder?.length > 0) {
    return itemsIds.sort((a, b) => partyRank.itemsOrder.indexOf(a) - partyRank.itemsOrder.indexOf(b));
  }
  return seededRandom({ seed: partyRank._id }).shuffle(itemsIds);
};
