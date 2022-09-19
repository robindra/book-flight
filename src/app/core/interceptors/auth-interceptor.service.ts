import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { exhaustMap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/login/auth.service';
import { UserModel } from 'src/app/modules/login/models/login-models';
@Injectable({ providedIn: 'root' })
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private _authService: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
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
