import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/login/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;

  private userSub: Subscription = new Subscription()

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {
    this.userSub = this._authService.user.subscribe((user: any) => {
      this.isAuthenticated = !!user.email;
    });
  }

  onLogout() {
    this._authService.logout();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

}
