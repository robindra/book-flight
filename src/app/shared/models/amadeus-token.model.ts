export class AmadeusToken {
  constructor(   
    public client_id: string,
    public token_type: string,
    private _access_token: string,
    public expires_in: Date
  ) {}

  get accessToken() {
    return this._access_token;
  }
}
