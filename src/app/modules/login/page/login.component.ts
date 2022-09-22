import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthResponseData } from '../models/login-models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isLogInMode: boolean = true;
  isLoading: boolean = false;
  error: string = '';

  constructor(private _authService: AuthService, private _router: Router) {}

  ngOnInit(): void {}

  onSwitchMode() {
    this.isLogInMode = !this.isLogInMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;
    this.isLoading = true;

    const email = form.value.email;
    const password = form.value.password;
    let authObs: Observable<AuthResponseData>;
    if (this.isLogInMode) {
      authObs = this._authService.login(email, password)
    } else {
      authObs = this._authService.signup(email, password)
    }

    authObs.subscribe(
      (resData) => {
        this._router.navigate(['/home'])
        this.isLoading = false;
      },
      (errorMessage) => {
        this.error = errorMessage;
        this.isLoading = false;
      }
    );
    form.reset();
  }  
}
