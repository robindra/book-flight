import { Component, OnInit } from '@angular/core';
import { AuthService } from './modules/login/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'book-flight';
  constructor(private _authService: AuthService) {

  }
  ngOnInit() {
    this._authService.autoLogin();
  }
}
