import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-flight-details',
  templateUrl: './flight-details.component.html',
  styleUrls: ['./flight-details.component.css']
})
export class FlightDetailsComponent implements OnInit {

  @Input('segmentations') segmentations: any;
  constructor() { }

  ngOnInit(): void {
  }

}
