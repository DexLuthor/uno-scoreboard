import {Component, HostListener, OnInit} from '@angular/core';
import {Player} from "./Player";

import {faArrowRightRotate} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  iconReset = faArrowRightRotate

  ngOnInit(): void {
    const state = localStorage.getItem('state');
    if (state) {
      this.players = JSON.parse(state);
    }
  }

  players: Player[] = [
    {name: 'Zheka', history: []},
    {name: 'Valentyna', history: []},
    {name: 'Bruce', history: []},
  ];
  readonly pointInputs: (number | null)[] = [
    null,
    null,
    null
  ]

  @HostListener("window:keydown.enter")
  next() {
    this.players.forEach((player, i) => {
      let pointsToAccount = this.pointInputs[i] || 0;

      player.history.push(pointsToAccount);

      this.pointInputs[i] = null;
    })
    localStorage.setItem('state', JSON.stringify(this.players));
  };

  score(p: Player) {
    return p.history.reduce((a, b) => a + b, 0)
  }

  winsNumber(p: Player) {
    return p.history.filter(round => round === 0).length
  }

  reset() {
    this.players.forEach(p => p.history = [])
    localStorage.removeItem('state');
  }
}
