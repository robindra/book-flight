import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponseData, UserModel } from './models/login-models';
import { catchError, tap } from 'rxjs/operators';
import { Observable, Subject, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<UserModel>(new UserModel('', '', '', new Date()));

  constructor(private _http: HttpClient, private _router: Router) {}

  /**
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  signup(email: string, password: string) {
    return this._http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBTJofvfKTSOpd5TZvr647quZtDvjIhZXE',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData: AuthResponseData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  login(email: string, password: string) {
    return this._http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBTJofvfKTSOpd5TZvr647quZtDvjIhZXE',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((resData: AuthResponseData) => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new UserModel(email, userId, token, expirationDate);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  logout() {
    this.user.next(new UserModel('', '', '', new Date()));
    this._router.navigate(['/login']);
  }

  private handleError = (errorRes: HttpErrorResponse) => {
    let errorMessage = 'An error occured!'; //
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    errorMessage = this.getErrorMsg(errorRes.error.error.message);
    return throwError(errorMessage);
  };


  getErrorMsg(key: string): string {
    switch (key) {
      case 'EMAIL_EXISTS':
        return 'The email address is already in use by another account.';
      case 'OPERATION_NOT_ALLOWED':
        return 'Password sign-in is disabled for this project.';
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'We have blocked all requests from this device due to unusual activity. Try again later.';
      case 'EMAIL_NOT_FOUND':
        return 'There is no user record corresponding to this identifier. The user may have been deleted.';
      case 'INVALID_PASSWORD':
        return 'The password is invalid or the user does not have a password.';
      case 'USER_DISABLED':
        return 'The user account has been disabled by an administrator.';
      default:
        return 'An error occured!';
    }
  }
}
