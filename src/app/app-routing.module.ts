import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/auth-guards/auth.guard';

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    path: 'home',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  // {
  //   path: 'search-results',
  //   loadChildren: () =>
  //     import('./modules/search-results/search-results.module').then(
  //       (m) => m.SearchResultsModule
  //     ),
  // },
  {
    path: 'login',
    loadChildren: () =>
      import('./modules/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./modules/register/register.module').then(
        (m) => m.RegisterModule
      ),
  },
  // {
  //   path: 'my-booking',
  //   canActivate: [AuthGuard],
  //   loadChildren: () =>
  //     import('./modules/my-booking/my-booking.module').then(
  //       (m) => m.MyBookingModule
  //     ),
  // },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
