import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { exhaustMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/login/auth.service';
import { UserModel } from 'src/app/modules/login/models/login-models';
import { AmadeusService } from 'src/app/shared/services/amadeus.service';
import { TokenResponse } from 'src/app/shared/interface/amadeus.interface';
import { AmadeusToken } from 'src/app/shared/models/amadeus-token.model';
@Injectable({ providedIn: 'root' })
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private _authService: AuthService,
    private _amadeusService: AmadeusService
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.indexOf('amadeus') > -1) {
      if (req.url.indexOf('token') > -1) {
        return next.handle(req);
      } else {
        //   return next.handle(req);
        return this._amadeusService.tokenData.pipe(
          take(1),
          exhaustMap((tokenData) => {
            const modifiedReq = req.clone({
              headers: new HttpHeaders({
                "Authorization" : `${tokenData.token_type} ${tokenData.accessToken}`
              }),
            });
            return next.handle(modifiedReq);
          })
        );
      }
    } else {
      return this._authService.user.pipe(
        take(1),
        exhaustMap((user: any) => {
          if (!user) {
            return next.handle(req);
          }
          const modifiedReq = req.clone({
            params: new HttpParams().set('auth', user.token),
          });
          return next.handle(modifiedReq);
        })
      );
    }
  }
}
