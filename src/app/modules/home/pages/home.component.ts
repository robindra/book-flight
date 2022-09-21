import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  debounce,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  AirportCode,
  CarrierCodeResponse,
  CarrierCodes,
  SearchPayLoad,
} from 'src/app/shared/interface/amadeus.interface';
import { AmadeusToken } from 'src/app/shared/models/amadeus-token.model';
import { AmadeusService } from 'src/app/shared/services/amadeus.service';

import * as moment from 'moment';
import { TripType } from '../interface/trip-type.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  /**
   * This will use to show radio option to choose trip type on UI
   * On the basis of type, return date field will be enable/disabled
   */
  tripTypes: TripType[] = [
    { type: 'one-way', label: 'One Way' },
    { type: 'roundtrip', label: 'Round Trip' },
  ];

  /**
   * This variable will use to show the number of travel to select in the ui
   */
  travellers: number[] = [...Array(15).keys()];

  /**
   * This field will use to control/disable fromDate field from selecting past date
   * Initial the value should be today date
   */
  minValidStartDate: string;

  /**
   * This field will use to control/disable returnDate field from selecting past date
   * Initial the value should be today date and whenever fromDate change it should change with fromDate
   */
  minValidReturnDate: string;

  /**
   * This field will use to disabled the return date field when user select only one way trip
   */
  disableReturnDate: boolean = true;

  /**
   * This flag will handle show the auto suggest depending on the below code. The value can be tripFrom/ tripTo
   */
  searchCodeFor: string = 'tripFrom';

  /**
   * This field will store the search result for one way trip
   */
  oneWaySerachResults: any = [];

  /**
   * This field will store the search result for return way trip
   */
  returnSearchResults: any = [];

  /**
   * This flag will indicate if api dont found any flight with selected date/source/destintion
   */
  noFlightFound: boolean = false;

  /**
   * In the flight search result, the flight carrier name will be in THREE CHAR code,
   * To get the exact data, we need to make another api call to get the details of each code
   */
  airportWithCountryCode: Array<AirportCode> = [];

  /**
   * This will store the details fo each THREE CHAR flight carrier details and the same will be use in UI
   */
  carrierCodes: CarrierCodes;

  /**
   * As the UI need the complete carrier details, hence we need to wait to get carrier details.
   * This flag will be true when api returns the carrrier details
   */
  isCarrierDataAvailable: boolean = false;

  /**
   * This flag will handle to show loader whenever user make the new search
   */
  isLoading: boolean = false;

  /**
   * This will store all the search results recived when user make search for one way
   */
  tripFromDetails: AirportCode;

  /**
   * This will store all the search results recived when user make search for return way
   */
  tripToDetails: AirportCode;

  /**
   * Intializing the search form
   */
  searchForm: FormGroup = new FormGroup({
    tripType: new FormControl('one-way'),
    tripFrom: new FormControl('', [Validators.required]),
    tripTo: new FormControl('', [Validators.required]),
    departOn: new FormControl(null, [
      Validators.required,
      Validators.minLength(5),
    ]),
    returnOn: new FormControl(''),
    adults: new FormControl(0, [Validators.required]),
    children: new FormControl(0),
    travelClass: new FormControl('Economy class', [Validators.required]),
  });

  /**
   * As we need to get token to access FLIGHT API from third party, we need to have token first
   * This will handle to subscribe to get token.
   */
  getTokenSubs = new Subscription();

  constructor(private _amadeusService: AmadeusService) {}

  ngOnInit(): void {
    // initiate the start/return date
    this.minValidStartDate = moment(new Date()).format('YYYY-MM-D');
    this.minValidReturnDate = this.minValidStartDate;
    this.isTokenExistsOrExpires();

    /**
     * Detect any change on trip type to enable/disabled return date field
     */
    this.searchForm
      .get('flyType')
      ?.valueChanges.subscribe((flyType: string) => {
        this.disableReturnDate = !(flyType == 'roundtrip');
      });

    /**
     * subscribe whenever value change on user type on trip from field
     *  - before we make api call
     *  -- should wait for 100 mili seconds
     *  -- the char should changed
     *  -- the car should be min 3 char
     *  -- switchMap to cancel if use keep changing the char so the previous request should cancel
     * */
    this.searchForm
      .get('tripFrom')
      ?.valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        filter((searchText: string) => searchText.length >= 3),
        switchMap((searchText: string) =>
          this._amadeusService.getAirportsByText(searchText)
        )
      )
      .subscribe((response: Array<AirportCode>) => {
        this.searchCodeFor = 'tripFrom';
        this.airportWithCountryCode = response;
      });

    /**
     * subscribe whenever value change on user type on trip to field
     *  - before we make api call
     *  -- should wait for 100 mili seconds
     *  -- the char should changed
     *  -- the car should be min 3 char
     *  -- switchMap to cancel if use keep changing the char so the previous request should cancel
     * */
    this.searchForm
      .get('tripTo')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((searchText: string) => searchText.length > 3),
        switchMap((searchText: string) =>
          this._amadeusService.getAirportsByText(searchText)
        )
      )
      .subscribe((response: Array<AirportCode>) => {
        this.searchCodeFor = 'tripTo';
        this.airportWithCountryCode = response;
      });

    /**
     * Whenever user change the departure date update the date to control the past date
     */
    this.searchForm
      .get('departOn')
      ?.valueChanges.subscribe((departureDate: string) => {
        this.minValidStartDate = departureDate;
      });
  }

  /**
   * This method will use to access form in the template
   *  f[control_name]
   */
  get f(): { [key: string]: AbstractControl } {
    return this.searchForm.controls;
  }

  /**
   * When user land on the home page to search the flight, first need to check whether token for third party api is exist/valid
   * @returns
   */
  isTokenExistsOrExpires(): void {
    // fetch token of localstorage if any
    let tokenData: {
      client_id: string;
      token_type: string;
      _access_token: string;
      expires_in: string;
    } = JSON.parse(localStorage.getItem('tokenData') || '{}');

    // if no data found then get the tokens
    if (!tokenData.client_id) {
      this.getTokens();
      return;
    } else {
      // if there is token data then set the token object again
      const loadedToken = new AmadeusToken(
        tokenData.client_id,
        tokenData.token_type,
        tokenData._access_token,
        new Date(tokenData.expires_in)
      );
      const isTokenExpires =
        new Date(loadedToken.expires_in).getTime() - new Date().getTime();

      // check whether the stored token is expires or not
      if (loadedToken.accessToken && isTokenExpires > 0) {
        this._amadeusService.updateToken(loadedToken);
      } else {
        this.getTokens();
      }
    }
  }

  /**
   * This method will make the api call to get the new Token which will enable to access flight search api etc.
   */
  getTokens() {
    const payLoad = {
      grant_type: 'client_credentials',
      client_id: environment.API_ID,
      client_secret: 'bMYj94SnZzuWAUe8',
    };
    this.getTokenSubs = this._amadeusService
      .getAuthToken(payLoad)
      .subscribe((response) => {
        /**
         * Not action require as the token will store in the model/local storage through service
         */
      });
  }

  /**
   * Whenever user click on the destination on the list this method will help to store the data and set the value in the form to show in UI
   * @param airPortInfo
   * @param tripToOrFrom
   */
  onSelectAirport(airPortInfo: AirportCode, tripToOrFrom: string) {
    if (tripToOrFrom == 'tripFrom') {
      this.tripFromDetails = airPortInfo;
      this.searchForm.patchValue({
        tripFrom: `${airPortInfo.cityName} ${airPortInfo.cityCode}`,
      });
    } else {
      this.tripToDetails = airPortInfo;
      this.searchForm.patchValue({
        tripTo: `${airPortInfo.cityName} ${airPortInfo.cityCode}`,
      });
    }
    this.airportWithCountryCode = [];
  }

  /**
   * This method will call whenever user submit the form
   * This is the main method which will handle to fetch avaialable flight details
   */
  onSubmitSearchForm(): void {
    this.noFlightFound = false;
    this.isLoading = true;
    this.isCarrierDataAvailable = false;
    

    // the api require time time in the payload as we show only date selection so we need to create current time
    const currentTime = moment(new Date()).format('HH:mm:ss');

    const adultTravellerCount = this.searchForm.value.adults;
    const childrenTravellerCount = this.searchForm.value.children;

    // Trip start date
    const departDate = this.searchForm.value.departOn;

    // trip return date (if any)
    const returnDate = this.searchForm.value.returnOn;

    // check the require field are entered 
    if (!this.tripFromDetails.cityCode || !this.tripToDetails.cityCode || !departDate.length || !returnDate.length) {
      return;
    } 

    // creating a variable to hold return flight search payload if user select two way trip
    let returnPayLoad: SearchPayLoad;

    // if user select two way, then need to make two apis call hence we will use forkJoin to
    // hence even one way, we are using forkJoin
    // this variable will store both the api call link
    const requestAPIs = [];

    /**
     * Generating payload for one way
     */
    const oneWayPayLoad = {
      originDestinations: [
        {
          id: '1',
          originLocationCode: this.tripFromDetails.cityCode,
          destinationLocationCode: this.tripToDetails.cityCode,
          departureDateTime: {
            date: departDate,
            time: currentTime,
          },
        },
      ],
      travelers: [
        {
          id: '1',
          travelerType: 'ADULT',
        },
        {
          id: '2',
          travelerType: 'CHILD',
        },
      ],
      sources: ['GDS'],
    };
    requestAPIs.push(this._amadeusService.flightAvailabilities(oneWayPayLoad));

    /**
     * check whether user select the round trip if yes,
     * then we need to make a copy of oneWay payload and alter tripTo and tripFrom and update departure date
     */
    if (this.searchForm.value.flyType == 'roundtrip') {
      // creating copy of one way payload
      returnPayLoad = { ...oneWayPayLoad };
      returnPayLoad.originDestinations[0] = {
        id: '1',
        originLocationCode: this.tripToDetails.cityCode,
        destinationLocationCode: this.tripFromDetails.cityCode,
        departureDateTime: {
          date: returnDate,
          time: currentTime,
        },
      };
      requestAPIs.push(
        this._amadeusService.flightAvailabilities(returnPayLoad)
      );
    }

    // call the fork join to make the api call
    forkJoin(requestAPIs).subscribe((response: any) => {
      // if not data received then show msge the no flighg found ....
      if (!response[0].data) {
        this.noFlightFound = true;
      } else {
        // if resonse comes then make the another call to get all the carrier code with details
        this.getAllCareeriCode(response[0].data);

        // store one way trip results
        this.oneWaySerachResults = response[0].data;

        if (response[1]) {
          // store return trip results if any
          this.returnSearchResults = response[1].data;
        }
      }
      // reset the flag to shid ethe loader
      this.isLoading = false;
    });
  }

  /**
   * Below method will handle the make api call for all the carrier receives on the search results
   */
  getAllCareeriCode(allRecords: any): void {
    var carrierCodes: { [key: string]: string } = {};
    /**
     * For each record, the carrier could be one or multple
     * hence, first need to list out all the carrier and create an object
     */
    allRecords.forEach((item: any) => {
      if (item.segments) {
        const segements = item.segments;
        for (let i = 0; i < segements.length; i++) {
          if (!carrierCodes[segements[i].carrierCode]) {
            carrierCodes[segements[i].carrierCode] = segements[i].carrierCode;
          }
        }
      }
    });
    // api need the carrier code in the url with comma separater hence we join the keys of the object with ,
    this._amadeusService
      .getCarrierDataByCode(Object.keys(carrierCodes).join(','))
      .subscribe((response: CarrierCodes) => {
        this.carrierCodes = response;
        this.isCarrierDataAvailable = true;
      });
  }
}
