import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  handleError = (errorRes: HttpErrorResponse) => {
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

  calTimeDiff(startTime: string, endTime: string) {
    return moment(endTime).diff(moment(startTime), 'hours');
  }
}
