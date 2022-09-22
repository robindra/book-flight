import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CarrierCodeResponse,
  CarrierCodes,
  SearchPayLoad,
  TokenPayLoad,
  TokenResponse,
} from '../interface/amadeus.interface';
import { AmadeusToken } from '../models/amadeus-token.model';
import { UtilsService } from '../utils/utils.service';

@Injectable({
  providedIn: 'root',
})
export class AmadeusService {
  /**
   * We are storing the authentical data to access the fly search api service
   */
  tokenData = new BehaviorSubject<AmadeusToken>(
    new AmadeusToken('', '', '', new Date())
  );

  /**
   * This variable will hold all the details for a parituclar airline / carrier details
   */
  carrierDetailsWithCode: CarrierCodes;

  constructor(
    private _httpClient: HttpClient,
    private _utilService: UtilsService
  ) {}

  /**
   * @description This method will use to get access to token.
   * @param payLoad
   * @returns
   */
  getAuthToken(payLoad: TokenPayLoad): Observable<TokenResponse> {
    let body = new URLSearchParams();
    body.set('grant_type', payLoad.grant_type);
    body.set('client_id', payLoad.client_id);
    body.set('client_secret', payLoad.client_secret);

    let options = {
      headers: new HttpHeaders().set(
        'Content-Type',
        'application/x-www-form-urlencoded'
      ),
    };
    return this._httpClient
      .post<TokenResponse>(
        `${environment.AMADEUS_BASE_URL}security/oauth2/token`,
        body,
        options
      )
      .pipe(
        catchError(this.handleErrors),
        tap((resData: TokenResponse) => {
          this.handleToken(
            resData.client_id,
            resData.token_type,
            resData.access_token,
            resData.expires_in
          );
        })
      );
  }

  /**
   * This method will handle to store the token information on observable and local storage
   * @param client_id string
   * @param token_type  string
   * @param access_token string
   * @param expires_in string
   */
  handleToken(
    client_id: string,
    token_type: string,
    access_token: string,
    expires_in: number
  ) {
    const expiresIn = new Date(new Date().getTime() + expires_in * 1000);
    const token = new AmadeusToken(
      client_id,
      token_type,
      access_token,
      expiresIn
    );
    this.tokenData.next(token);
    // this.autoLogout(expiresIn * 1000);
    localStorage.setItem('tokenData', JSON.stringify(token));
  }

  /**
   *
   * @param tokenData
   */
  updateToken(tokenData: AmadeusToken) {
    this.tokenData.next(tokenData);
  }

  /**
   * This method will handle to fetch city/airport data when user type on the source and destination input
   * @param cityCode
   * @returns
   */
  getAirportsByText(cityCode: string) {
    return this._httpClient
      .get(
        `${environment.AMADEUS_BASE_URL}reference-data/locations?subType=CITY,AIRPORT&keyword=${cityCode}`
      )
      .pipe(
        catchError(this.handleErrors),
        map((cityData: any) => {
          return cityData.data
            .filter((city: any) => city.subType == 'AIRPORT')
            .map((city: any) => {
              const address = city.address;
              return {
                ...address,
                airportName: city.name,
              };
            });
        })
      );
  }

  /**
   * This method will handle to fetch the availble fligth details with selected source and destination
   * @param payLoad
   * @returns
   */
  flightAvailabilities(payLoad: SearchPayLoad) {
    return this._httpClient
      .post(
        `${environment.AMADEUS_BASE_URL}shopping/availability/flight-availabilities`,
        payLoad
      )
      .pipe(
        catchError(this.handleErrors),
        map((response: any) => {
          if (!response.data) return response;
          response.data = response.data.map((lists: any) => {
            lists.summary = this.generateSummary(lists.segments);
            return lists;
          });
          return response;
        })
      );
  }

  /**
   * This method is responsible to access the airline details with codes 
   * @param carrierCodes
   * @returns
   */
  getCarrierDataByCode(carrierCodes: string) {
    return this._httpClient
      .get(
        'https://test.api.amadeus.com/v1/reference-data/airlines?airlineCodes=' +
          carrierCodes
      )
      .pipe(
        catchError(this.handleErrors),
        map((response: any) => {
          let modifiedResponse: any = {};
          response.data.forEach((item: CarrierCodeResponse) => {
            modifiedResponse[item.iataCode] = item;
          });
          return modifiedResponse;
        }),
        tap((data) => {
          this.carrierDetailsWithCode = data;
        })
      );
  }

  /**
   *
   * @param errorRes
   * @returns
   */
  private handleErrors = (errorRes: HttpErrorResponse) => {
    let errorMsg = 'An unknown error occured!';
    if (!errorRes.error.errors || !errorRes.error.errors.length) {
      return throwError(errorMsg);
    }
    errorMsg = errorRes.error.errors[0].title;
    return throwError(errorMsg);
  };

  /**
   * This a helper function which will create a new object summary as per UI requirement
   * The return response of fligh -availablity has multple records and its complex to show the 
   * content directly on the UI
   * This method will create a new object and store the data in summary field in the repsonse 
   * @param segements
   * @returns
   */
  private generateSummary(segements?: any) {
    let summary: any = {
      departure: segements[0].departure,
      arrival: segements.length > 1
          ? segements[segements.length - 1].arrival
          : segements[0].arrival,
    };

    const departTime = segements[0].departure.at;

    // if the segmentats is more than 1 means its connecting then we need to get the 
    // arrival time from the last segement 
    const arrivalTime = segements.length
      ? segements[segements.length - 1].arrival.at
      : segements[0].arrival.at;
    
    
    const carrierCodes: any = [];

    // total duration 
    summary.totalHours = this._utilService.calTimeDiff(departTime, arrivalTime);

    // as api not retruning any price so add new fild with auto generated 
    summary.price = Math.floor(Math.random() * (15000 - 5000 + 1) + 5000);

    // this will store all the routes for eact trip 
    summary.routes = {
      connecting: segements.length - 1,
      via:
        segements.length > 1
          ? segements.slice(1).map((segment: any) => segment.departure.iataCode)
          : [],
    };

    // this will get all the unique carrier codes in the result which will use to fetch carrier 
    // details to show in the result ui page
    segements.forEach((item: any) => {
      if (JSON.stringify(carrierCodes).indexOf(item.carrierCode) == -1) {
        carrierCodes.push({
          carrierCode: item.carrierCode,
          aircraft: item.aircraft.code,
        });
      }
    });

    summary.carrierCodes = carrierCodes;

    return summary;
  }
}
