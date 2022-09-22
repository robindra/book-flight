import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterResults'
})
export class FilterResultsPipe implements PipeTransform {

  transform(value: any, filterBy: string): any {
    let results = value;
    switch (filterBy) {
      case 'price_asc':
        return this.orderByPrice(value, true);
        case 'price_dsc':
          return this.orderByPrice(value, false);
      case 'non-connecting':
        return this.filterByConnecting(value, 'none-connecting');
      case 'connecting':
        return this.filterByConnecting(value, 'connecting');
      case 'all':
        return this.filterByConnecting(value, 'all');
      case 'duration_asc':
        return this.filterByDuration(value, true);
      case 'duration_dsc':
        return this.filterByDuration(value, false);
    }
    return results;
  }

  orderByPrice(value: any, asc: boolean) {
    return value.sort((item1: any, item2: any) => {
      return item1.summary.price > item2.summary.price && asc ? 1 : -1
    });
  }

  filterByConnecting(value: any, connetionType: string) {
    return value.filter((flight:any) => {
      if (connetionType == 'connecting') {
        return flight.summary.routes.connecting > 1
      } 
      if (connetionType == 'none-connecting') {
        return flight.summary.routes.connecting == 0;
      }
      return flight;
    });
  }

  filterByDuration(value: any, asc: boolean) {
    return value.sort((item1: any, item2: any) => {
      if (asc) {
        return item1.summary.totalHours > item2.summary.totalHours ? 1 : -1;
      } else {
        return item1.summary.totalHours > item2.summary.totalHours ? -1 : 1;
      }
    });
  }

  
}
