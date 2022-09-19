import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyBookingRoutingModule } from './my-booking-routing.module';
import { MyBookingComponent } from './page/my-booking.component';


@NgModule({
  declarations: [
    MyBookingComponent
  ],
  imports: [
    CommonModule,
    MyBookingRoutingModule
  ]
})
export class MyBookingModule { }
