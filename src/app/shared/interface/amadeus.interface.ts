export interface TokenPayLoad {
  grant_type: string;
  client_id: string;
  client_secret: string;
}

export interface TokenResponse {
  type: string;
  username: string;
  application_name: string;
  client_id: string;
  token_type: string;
  access_token: string;
  expires_in: number;
  state: string;
  score: string;
}

export interface AirportCode {
  cityName: string;
  cityCode: string;
  countryName: string;
  countryCode: string;
  stateCode: string;
    regionCode: string;
    airportName: string
}
export interface Traveler {
  id: string;
  travelerType: string;
}

export interface departureDateTime {
  date: string;
  time: string;
}
 
export interface DestinationData {
  id: string, 
  originLocationCode: string;
  destinationLocationCode: string;
  departureDateTime: departureDateTime
}

export interface SearchPayLoad {
  originDestinations: Array<DestinationData>;
  travelers: Array<Traveler>;
  sources: Array<string>;
}

export interface CarrierCodeResponse {
  businessName: string;
  commonName: string;
  iataCode: string;
  icaoCode: string;
  type: string;
}

export interface CarrierCodes {
  [key: string]: CarrierCodeResponse
}

export interface FlightInfo {
  duration: string;
  id: string;
  instantTicketingRequired: string;
  originDestinationId: string;
  paymentCardRequired: false;
  segments: Segments
}
 
export interface Segments {
  aircraft: Object, 
  arrival: Object,
  availabilityClasses: []
}
