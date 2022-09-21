import { Pipe, PipeTransform } from '@angular/core';
import { AmadeusService } from '../services/amadeus.service';


@Pipe({
  name: 'carrierName'
})
export class CarrierNamePipe implements PipeTransform {
  constructor(private _amadeusService: AmadeusService) {

  }
  transform(value: string, ...args: unknown[]): unknown {    
    return this._amadeusService.carrierDetailsWithCode[value] ? this._amadeusService.carrierDetailsWithCode[value].iataCode : value;
  }

}
