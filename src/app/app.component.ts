import {Component, HostListener, OnInit} from '@angular/core';
import {Player} from "./model/Player";

import {faArrowRightRotate, faChevronLeft, faMoon, faSun} from '@fortawesome/free-solid-svg-icons';
import {Config} from "./model/Config";
import {PersistenceService} from "./services/persistence.service";
import {PersistableState} from "./model/PersistableState";

@Component({
  selector: 'root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  iconReset = faArrowRightRotate
  iconChevronLeft = faChevronLeft
  iconSun = faSun
  iconMoon = faMoon

  players: Player[] = [];
  threshold = 200
  pointInputs: (number | null)[] = []
  dark: boolean
  finished: boolean = false
  showConfig: boolean = true

  constructor(private persistenceService: PersistenceService) {
    const preferredTheme = persistenceService.getPreferredTheme();
    this.dark = preferredTheme === 'dark'
    document.body.classList.add(preferredTheme)
  }

  private static calculatePointsFor(player: Player): number {
    return player.history.reduce((a, b) => a + b, 0)
  }

  ngOnInit(): void {
    this.restoreAndReconcileState()
    this.assignDealer()

    this.pointInputs = this.players.map(_ => null)
    this.checkVictory()
    this.showConfig = this.showConfigDialog()
  }

  @HostListener("window:keydown.enter")
  next() {
    if (this.showConfigDialog() || this.finished) {
      return
    }

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

    this.checkVictory()
  };

  reset() {
    this.players.forEach(p => {
      p.dealer = false
      p.history = []
    })
    this.players[0].dealer = true
    this.pointInputs = this.pointInputs.map(_ => null)

    this.persistenceService.flushState()
    this.showConfig = this.showConfigDialog()
    console.log(this.showConfigDialog())
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

    this.finished = false
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
    this.showConfig = false;
  }

  toggleTheme(): void {
    this.dark = document.body.classList.toggle('dark');
    this.persistenceService.setPreferredTheme(this.dark ? 'dark' : 'light')
  }

  playerSuccess(idx: number): "winner" | "looser" | null {
    const points = this.players.map(p => AppComponent.calculatePointsFor(p));
    const min = Math.min(...points)

    if (this.finished && AppComponent.calculatePointsFor(this.players[idx]) === min) {
      return "winner"
    } else if (AppComponent.calculatePointsFor(this.players[idx]) >= this.threshold) {
      return "looser"
    }

    return null;
  }

  private showConfigDialog(): boolean {
    const state = this.persistenceService.readState();
    return !state.threshold || state.players.length < 2
  }

  private checkVictory(): void {
    if (this.players.some(p => AppComponent.calculatePointsFor(p) >= this.threshold)) {
      this.finished = true
    }
  }

  private restoreAndReconcileState(): void {
    const state: PersistableState = this.persistenceService.readState()

    // The local storage state isn't updated with new properties of the Player model.
    // In case the model was once stored on the user side and then an update has been released
    // model changes would never get to local storage unless ...new Player() syncs things
    this.threshold = state.threshold
    this.players = state.players.map(player => ({
      ...new Player(),
      ...player
    }))
  }

  private assignDealer(): void {
    if (this.players.length) {
      const noDealer = this.players.every(player => !player.dealer)
      if (noDealer) {
        this.players[0].dealer = true
      }
    }
  }
}
