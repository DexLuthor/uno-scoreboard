import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {FormsModule} from "@angular/forms";
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {PlayerComponent} from './player/player.component';
import {DialogComponent} from './dialog/dialog.component';

@NgModule({
  declarations: [AppComponent, PlayerComponent, DialogComponent],
  imports: [BrowserModule, FormsModule, FontAwesomeModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}
