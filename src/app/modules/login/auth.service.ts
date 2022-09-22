import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthResponseData, UserModel } from './models/login-models';
import { catchError, tap } from 'rxjs/operators';
import { Observable, Subject, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/shared/utils/utils.service';
import { environment } from 'src/environments/environment';

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
   *  @descripton The below method will handle to signup the user on firsbase database
   * @param email string
   * @param password string
   * @returns an observable
   */
  signup(email: string, password: string): Observable<AuthResponseData> {
    return this._http
      .post<AuthResponseData>(
        `${environment.FIREBASE_BASE_URL}accounts:signUp?key=AIzaSyBTJofvfKTSOpd5TZvr647quZtDvjIhZXE`,
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
   *  @descripton The below method will handle to login the user on firsbase
   * @param email string
   * @param password string
   * @returns an observable
   */
  login(email: string, password: string): Observable<AuthResponseData> {
    return this._http
      .post<AuthResponseData>(
        `${environment.FIREBASE_BASE_URL}accounts:signInWithPassword?key=AIzaSyBTJofvfKTSOpd5TZvr647quZtDvjIhZXE`,
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
   * @description handleAuthentication will handle to store the user authentication data and auto logout process
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
    // calculate the expirate date as per input 
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);

    // update the user model with new information 
    const user = new UserModel(email, userId, token, expirationDate);

    // notify the user authentication information 
    this.user.next(user);

    // set a timeout to auto logout the user 
    this.autoLogout(expiresIn * 1000);

    // store the authentication data which will use when user refresh the page 
    localStorage.setItem('userData', JSON.stringify(user));
  }

  /**
   * @description autoLogin will handle to login the user whenever user refresh
   *              It will check the authentical data in local storage 
   * @returns
   */
  autoLogin(): void {
    let userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpiredDate: string;
    } = JSON.parse(localStorage.getItem('userData') || '{}');

    // if not user data found then no action require 
    if (!userData) {
      return;
    }

    // create new model data with updated expiration time 
    const loadedUser = new UserModel(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpiredDate)
    );

    // if the token is valid the need the notify the update the user model data 
    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expireDuration =
        new Date(userData._tokenExpiredDate).getTime() - new Date().getTime();
      this.autoLogout(expireDuration);
    }
  }

  /**
   * @description This method will handle to logout the user
   *              - when logout the user data and token data need to clear and user need to redirect to login page. 
   */
  logout(): void {
    this.user.next(new UserModel('', '', '', new Date()));
    this._router.navigate(['/login']);
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  /**
   * @description depending on the timer, logout will execute for auto logout the user 
   * @param expirationDuration
   */
  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
