import {Component, HostListener, OnInit} from '@angular/core';
import {Player} from "./Player";

import {faArrowRightRotate, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {Config} from "./Config";
import {PersistenceService} from "./services/persistence.service";
import {PersistableState} from "./PersistableState";

@Component({
  selector: 'root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  iconReset = faArrowRightRotate
  iconChevronLeft = faChevronLeft

  players: Player[] = [];
  threshold = 200
  pointInputs: (number | null)[] = []

  constructor(private persistenceService: PersistenceService) {
  }

  ngOnInit(): void {
    this.restoreAndReconcileState()
    this.assignDealer()

    this.pointInputs = this.players.map(_ => null)
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
    this.persistenceService.upsertState({players: this.players, threshold: this.threshold});
  };

  reset() {
    this.players.forEach(p => {
      p.dealer = false
      p.history = []
    })
    this.players[0].dealer = true
    this.pointInputs.forEach(input => input = null)

    this.persistenceService.flushState()
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
    this.persistenceService.upsertState({players: this.players, threshold: this.threshold});
  }

  backDisabled() {
    return !this.players || !this.players.every(player => player.history.length > 0)
  }

  pointsChanged(idx: number, points: number) {
    this.pointInputs[idx] = points
  }

  onConfigUpdated(config: Config) {
    // this.persistenceService.upsertConfig(config)
    this.persistenceService.upsertState({
      threshold: config.threshold,
      players: config.players.map(name => ({
        name,
        history: [],
        dealer: false
      }))
    })
    this.restoreAndReconcileState()
    this.assignDealer()
  }

  showConfigDialog(): boolean {
    const state = this.persistenceService.readState();
    return !state.threshold || state.players.length < 2
  }

  private restoreAndReconcileState(): void {
    const state: PersistableState = this.persistenceService.readState()

    // The local storage state isn't updated with new properties of the Player model.
    // In case the model was once stored on the user side and then an update has been released
    // model changes would never get to local storage unless ...new Player() syncs things
    this.players = state.players.map(player => ({
      ...new Player(),
      ...player
    }))
  }

  private assignDealer() {
    if (this.players.length) {
      const noDealer = this.players.every(player => !player.dealer)
      if (noDealer) {
        this.players[0].dealer = true
      }
    }
  }
}
