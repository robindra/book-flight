import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, exhaustMap, map, take } from 'rxjs/operators';
import { AuthService } from '../login/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(
    private _httpCleint: HttpClient,
    private _authService: AuthService
  ) {}

  addNewPost(postData: { title: string; date: Date }) {
    return this._httpCleint
      .post(
        'https://book-my-flight-abfd0-default-rtdb.firebaseio.com/post.json',
        postData
      )
      .pipe(
        catchError((resError) => {
          console.log(resError);
          return throwError('An error occured');
        })
      );
  }

  getPosts() {
    return this._httpCleint
      .get(
        'https://book-my-flight-abfd0-default-rtdb.firebaseio.com/post.json'
      ).pipe(
        catchError((resError) => {
          console.log(resError);
          return throwError('An error occured');
        })
      );
  }
}
