import { NgModule } from '@angular/core';
import { CarrierNamePipe } from './pipes/carrier-name.pipe';
import { LodingSpinnerComponent } from './ui/loding-spinner/loding-spinner.component';
@NgModule({
    imports: [
        
     ],
    declarations: [
        LodingSpinnerComponent,
        CarrierNamePipe
    ],
    exports: [
        LodingSpinnerComponent,
        CarrierNamePipe
    ]
})
 
export class SharedModule {}