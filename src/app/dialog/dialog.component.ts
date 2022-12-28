import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {faCancel, faCheck, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons'
import {Config} from "../model/Config";

@Component({
  selector: 'settings-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  @Input("config") config: Config | null = null
  @Output("closeBackdrop") readonly closeEmitter = new EventEmitter<never>()
  @Output("configsUpdated") readonly configEmitter = new EventEmitter<Config>()

  iconCancel = faCancel
  iconSave = faCheck
  iconRemove = faTrash
  iconConfirm = faPlus

  modalOpened = true
  threshold: number | null = 200
  newPlayer: string | null = null
  players: string[] = []

  ngOnInit(): void {
    this.players = this.config?.players ?? []
    this.threshold = this.config?.threshold ?? 200
  }

  onModalDismiss() {
    this.closeEmitter.emit()
  }

  onSaveClicked() {
    this.configEmitter.emit({
      players: this.players,
      threshold: this.threshold ?? 200
    })
  }

  formIsInvalid(): boolean {
    return this.players.length < 2 || this.players.length > 10
  }

  dropOffPlayer(idx: number) {
    this.players.splice(idx, 1)
  }

  @HostListener("window:keydown.enter")
  addPlayer() {
    if (this.newPlayer) {
      this.players.push(this.newPlayer)
      this.newPlayer = null
    }
  }
}
