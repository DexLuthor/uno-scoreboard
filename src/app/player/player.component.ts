import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Player} from "../Player";
import {faShuffle} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  @Input("player") player!: Player
  @Input("pointsInput") pointInput: number | null = null;
  @Output("pointsChanged") readonly emitter = new EventEmitter<number>()
  iconDealer = faShuffle

  score(p: Player) {
    return p.history.reduce((a, b) => a + b, 0)
  }

  winsNumber(p: Player) {
    return p.history.filter(round => round === 0).length
  }

  pointsChanged(e: any) {
    this.emitter.emit(+e.target.value)
  }
}
