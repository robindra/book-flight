import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AuthService } from './modules/login/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'book-flight';
  constructor(private _authService: AuthService, private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      /**
       * This will hit whenever new version of ngsw.json available on the server 
       */
      this.swUpdate.available.subscribe(() => {
        if (confirm('New version of app is available. Do you want to reload the page now?')) {
          window.location.reload();
        }
      });
    }
  }
  ngOnInit() {
    this._authService.autoLogin();
  }
}
