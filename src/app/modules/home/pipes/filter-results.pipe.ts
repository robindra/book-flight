import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterResults',
})
export class FilterResultsPipe implements PipeTransform {
  transform(value: any, filterBy: string): any {
    let results = value;
    switch (filterBy) {
      
      case 'non-connecting':
        return this.filterByConnecting(value, 'none-connecting');
      case 'connecting':
        return this.filterByConnecting(value, 'connecting');
      case 'all':
        return this.filterByConnecting(value, 'all');
    }
    return results;
  }

  

  filterByConnecting(value: any, connetionType: string) {
    return value.filter((flight: any) => {
      if (connetionType == 'connecting') {
        return flight.summary.routes.connecting > 1;
      }
      if (connetionType == 'none-connecting') {
        return flight.summary.routes.connecting == 0;
      }
      return flight;
    });
  }  
}
