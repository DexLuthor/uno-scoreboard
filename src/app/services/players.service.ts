import {Injectable} from '@angular/core';
import {Player} from "../model/Player";

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  private readonly _players: Player[] = []

  get players(): Player[] {
    return this._players;
  }

  public addPlayer(p: Player): void {
    this._players.push(p)
  }

  public deletePlayer(id: number): void {
    const index = this._players.findIndex(p => p.id === id);
    if (index !== -1) {
      this._players.splice(index, 1)
    }
  }
}
