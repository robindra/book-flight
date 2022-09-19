import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  postSubs = new Subscription();
  allPosts: any = [];
  constructor(private _searchService: SearchService) { }

  ngOnInit(): void {
  }

  addNewRecord() {
    const randomText = this.makeid(15);
    const title = "booking id " + randomText;
    const date = new Date();    
    this.postSubs = this._searchService.addNewPost({ title: title, date: date }).subscribe(response => {
      console.log('response', response);
    })
  }

  getAllPost() {
    this._searchService.getPosts().subscribe((response: any) => {
      console.log(response)
      const data = response;
      this.allPosts = Object.keys(data).map(key=> data[key]);
    })
  }

  makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

}
