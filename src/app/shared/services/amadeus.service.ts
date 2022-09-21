import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, tap, throwError } from 'rxjs';
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
  tokenData = new BehaviorSubject<AmadeusToken>(
    new AmadeusToken('', '', '', new Date())
  );
  storeAirLineCode: any;
  carrierDetailsWithCode: CarrierCodes;
  constructor(
    private _httpClient: HttpClient,
    private _utilService: UtilsService
  ) {}

  getAuthToken(payLoad: TokenPayLoad) {
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

  updateToken(tokenData: AmadeusToken) {
    this.tokenData.next(tokenData);
  }

  getCityName(cityCode: string) {
    return this._httpClient
      .get(
        `${environment.AMADEUS_BASE_URL}reference-data/locations?subType=CITY,AIRPORT&keyword=${cityCode}`
      )
      .pipe(catchError(this.handleErrors));
  }

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

  // getCarrierData(codes: string[]) {
  //   return this.getCarrierDataByCode(codes.join(',')).subscribe((response) => {
  //     console.log('response', response);
  //   });
  // }

  /**
   *
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
   *
   * @param segements
   * @returns
   */
  private generateSummary(segements?: any) {
    let summary: any = {
      departure: segements[0].departure,
      arrival:
        segements.length > 1
          ? segements[segements.length - 1].arrival
          : segements[0].arrival,
    };
    const departTime = segements[0].departure.at;
    const arrivalTime = segements.length
      ? segements[segements.length - 1].arrival.at
      : segements[0].arrival.at;
    const carrierCodes: any = [];
    summary.totalHours = this._utilService.calTimeDiff(departTime, arrivalTime);
    summary.price = Math.floor(Math.random() * (15000 - 5000 + 1) + 5000);
    summary.routes = {
      connecting: segements.length - 1,
      via:
        segements.length > 1
          ? segements.slice(1).map((segment: any) => segment.departure.iataCode)
          : [],
    };
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
