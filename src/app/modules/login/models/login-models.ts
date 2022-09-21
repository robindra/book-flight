export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export class UserModel {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpiredDate: Date
  ) {}
  get token() {
    if (!this._tokenExpiredDate || new Date() > this._tokenExpiredDate) {
      return null;
    }
    return this._token;
  }
}
