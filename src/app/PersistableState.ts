import {Player} from "./Player";

export interface PersistableState {
  players: Player[]
  threshold: number
}
