import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/share.module';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { FilterResultsPipe } from './pipes/filter-results.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';



@NgModule({
  declarations: [
    HomeComponent, 
    SearchResultsComponent,
    FilterResultsPipe,
    OrderByPipe
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class HomeModule { }
