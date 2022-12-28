import {Injectable} from '@angular/core';
import {PersistableState} from "../model/PersistableState";

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  // private static readonly CONFIG_KEY = 'config'
  private static readonly STATE_KEY = 'state'

  // upsertConfig(config: Config): void {
  //   localStorage.setItem(PersistenceService.CONFIG_KEY, JSON.stringify(config))
  // }
  //
  // readConfig(): Config | null {
  //   const config = localStorage.getItem(PersistenceService.CONFIG_KEY);
  //   return config ? JSON.parse(config) : null
  // }
  private static readonly PREFERRED_THEME = 'preferred-theme';

  upsertState(state: PersistableState): void {
    localStorage.setItem(PersistenceService.STATE_KEY, JSON.stringify(state));
  }

  flushState(): void {
    localStorage.removeItem(PersistenceService.STATE_KEY)
  }

  readState(): PersistableState {
    const state = localStorage.getItem(PersistenceService.STATE_KEY);
    if (state) {
      return JSON.parse(state)
    }
    return {
      players: [],
      threshold: 200
    }
  }

  getPreferredTheme(): "dark" | "light" {
    const theme = localStorage.getItem(PersistenceService.PREFERRED_THEME);
    if (theme) {
      return theme === "dark" ? "dark" : "light"
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  setPreferredTheme(theme: "dark" | "light") {
    localStorage.setItem(PersistenceService.PREFERRED_THEME, theme)
  }
}
