import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { map, Observable, take, tap } from 'rxjs';
import { AuthService } from 'src/app/modules/login/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this._authService.user.pipe(
      take(1),
      map((user: any) => {
        const isAuth = !!user.email;
        if (isAuth) {
          return true;
        } 
        return this._router.createUrlTree(['/login']);
      })
      //     ,
      //   tap((isAuth) => {
      //     if (!isAuth) {
      //       this._router.navigate(['/login']);
      //     }
      //   })
    );
  }
}
