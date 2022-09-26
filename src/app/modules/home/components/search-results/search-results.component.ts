import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @Input('searchResults') searchResults: any;
  @Input('searchResultFor') searchResultFor: string;
  @Input('totalTravellers') totalTravellers: number;

  priceOrderByAsc: boolean = true;

  durationOrderByAsc: boolean = true;

  filterCase: string = 'no-sort';
  
  connectingOptions: { type: string; label: string }[] = [
    { type: 'non-connecting', label: 'Non Connecting' },
    { type: 'connecting', label: 'Connecting' },
    { type: 'all', label: 'All' },
  ];

  filterForm: FormGroup = new FormGroup({
    connectingFlight: new FormControl('all'),
  });
  constructor() {}

  ngOnInit(): void { }
  
  ngAfterViewInit(): void {
    this.filterForm.get('connectingFlight')?.valueChanges.subscribe((connectionOption: string) => {
      this.filterCase = connectionOption;
    })
  }

  sortResult(sortBy: string) {
    if (sortBy == 'price') {
      this.priceOrderByAsc = !this.priceOrderByAsc;
      this.filterCase = this.priceOrderByAsc ? 'price_asc' : 'price_dsc';
    }

    if (sortBy == 'duration') {
      this.durationOrderByAsc = !this.durationOrderByAsc;
      this.filterCase = this.durationOrderByAsc
        ? 'duration_asc'
        : 'duration_dsc';
    }   
  }
}
