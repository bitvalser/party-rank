import { EventEmitter } from 'events';

export enum AppEvents {
  AddNewEntry = 'AddNewEntry',
  RemoveEntry = 'RemoveEntry',
  PartyRankStatusUpdate = 'PartyRankStatusUpdate',
  PartyRankKickUser = 'PartyRankKickUser',
}

export const appEventEmitter = new EventEmitter();
