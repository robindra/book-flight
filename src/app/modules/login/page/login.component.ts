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
  /**
   * This flag will handle to toggle the form submit form whether its for login/signup 
   */
  isLogInMode: boolean = true;

  /**
   * This flag will control the loading when login/signup 
   */
  isLoading: boolean = false;

  /**
   * This variable will hold the error text 
   */
  error: string = '';

  constructor(private _authService: AuthService, private _router: Router) {}

  ngOnInit(): void {}

  /**
   * This method will control the login/signup mode 
   */
  onSwitchMode() {
    this.isLogInMode = !this.isLogInMode;
  }

  /**
   * 
   * @param form 
   * @returns 
   */
  onSubmit(form: NgForm): void {    
    if (!form.valid) return;

    // set flag to show loader 
    this.isLoading = true;

    // get email from form 
    const email = form.value.email;

    // get the password data from form 
    const password = form.value.password;

    //create a variable which will store the login/sign up observable 
    let authObs: Observable<AuthResponseData>;
    if (this.isLogInMode) {
      authObs = this._authService.login(email, password)
    } else {
      authObs = this._authService.signup(email, password)
    }

    // subscribe the observable based on the login mode 
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
