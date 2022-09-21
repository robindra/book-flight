import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponseData, UserModel } from './models/login-models';
import { catchError, tap } from 'rxjs/operators';
import { Observable, Subject, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/shared/utils/utils.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = new BehaviorSubject<UserModel>(new UserModel('', '', '', new Date()));
  private tokenExpirationTimer: any;

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private _utilService: UtilsService
  ) {}

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
        catchError(this._utilService.handleError),
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

  /**
   *
   * @param email
   * @param password
   * @returns
   */
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
        catchError(this._utilService.handleError),
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

  /**
   *
   * @param email
   * @param userId
   * @param token
   * @param expiresIn
   */
  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new UserModel(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  /**
   *
   * @returns
   */
  autoLogin() {
    let userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpiredDate: string;
    } = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData) {
      return;
    }

    const loadedUser = new UserModel(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpiredDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expireDuration =
        new Date(userData._tokenExpiredDate).getTime() - new Date().getTime();
      this.autoLogout(expireDuration);
    }
  }

  /**
   *
   */
  logout() {
    this.user.next(new UserModel('', '', '', new Date()));
    this._router.navigate(['/login']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  /**
   *
   * @param expirationDuration
   */
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
