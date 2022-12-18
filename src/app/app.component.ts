import {Component, HostListener, OnInit} from '@angular/core';
import {Player} from "./Player";

import {faArrowRightRotate, faChevronLeft} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  iconReset = faArrowRightRotate
  iconChevronLeft = faChevronLeft
  players: Player[] = [
    {name: 'Zheka', history: [], dealer: true},
    {name: 'Valentyna', history: [], dealer: false},
    {name: 'Bruce', history: [], dealer: false},
  ];
  readonly pointInputs: (number | null)[] = [null, null, null]

  ngOnInit(): void {
    this.restoreAndReconcileState()
    this.assignDealer()
  }

  @HostListener("window:keydown.enter")
  next() {
    //account points
    this.players.forEach((player, i) => {
      let pointsToAccount = this.pointInputs[i] || 0;

      player.history.push(pointsToAccount);

      this.pointInputs[i] = null;
    })

    //dealer rotation
    const currentDealer = this.players.findIndex(player => player.dealer);
    const newDealer = currentDealer === this.players.length - 1 ? 0 : currentDealer + 1
    this.players[currentDealer].dealer = false
    this.players[newDealer].dealer = true

    //persist
    localStorage.setItem('state', JSON.stringify(this.players));
  };

  reset() {
    this.players.forEach(p => {
      p.dealer = false
      p.history = []
    })
    this.players[0].dealer = true
    this.pointInputs.forEach(input => input = null)

    localStorage.removeItem('state');
  }

  back() {
    //rollback points
    this.players.forEach((player, idx) => {
      let removed = player.history.pop();
      this.pointInputs[idx] = removed!
    })

    //dealer rotation
    const currentShuffler = this.players.findIndex(player => player.dealer);
    const newShuffler = currentShuffler === 0 ? this.players.length - 1 : currentShuffler - 1
    this.players[currentShuffler].dealer = false
    this.players[newShuffler].dealer = true

    //persist
    localStorage.setItem('state', JSON.stringify(this.players));
  }

  backDisabled() {
    return !this.players || !this.players.every(player => player.history.length > 0)
  }

  pointsChanged(idx: number, points: number) {
    this.pointInputs[idx] = points
  }

  private restoreAndReconcileState(): void {
    const state = localStorage.getItem('state');
    if (state) {
      const parsedState: Player[] = JSON.parse(state)

      // The local storage state isn't updated with new properties of the Player model.
      // In case the model was once stored on the user side and then an update has been released
      // model changes would never get to localStorage unless ...new Player() syncs things
      this.players = parsedState.map(player => ({
        ...new Player(),
        ...player
      }))
    }
  }

  private assignDealer() {
    const noDealer = this.players.every(player => !player.dealer)
    if (noDealer) {
      this.players[0].dealer = true
    }
  }
}
