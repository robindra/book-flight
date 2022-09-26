import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  
  transform(inputs: any, orderBy: string): any {
    switch (orderBy) {
      case 'price_asc':
        return this.orderByPrice(inputs, true);
      case 'price_dsc':
        return this.orderByPrice(inputs, false);
      case 'duration_asc':
        return this.orderByDuration(inputs, true);
      case 'duration_dsc':
        return this.orderByDuration(inputs, false);
    }
    return inputs;
  }

  orderByPrice(inputs: any, asc: boolean) {
    return inputs.sort((item1: any, item2: any) => {
      return item1.summary.price > item2.summary.price && asc ? 1 : -1;
    });
  }

  orderByDuration(inputs: any, asc: boolean) {
    return inputs.sort((item1: any, item2: any) => {
      if (asc) {
        return item1.summary.totalHours > item2.summary.totalHours ? 1 : -1;
      } else {
        return item1.summary.totalHours > item2.summary.totalHours ? -1 : 1;
      }
    });
  }
}
