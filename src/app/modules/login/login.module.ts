import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './page/login.component';
import { LodingSpinnerComponent } from 'src/app/shared/ui/loding-spinner/loding-spinner.component';


@NgModule({
  declarations: [
    LoginComponent, 
    LodingSpinnerComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule
  ]
})
export class LoginModule { }
