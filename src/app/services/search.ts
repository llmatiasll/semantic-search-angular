import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResult } from '../models/search-result';

export interface SearchResponse {
  results: SearchResult[];
}

@Injectable({
  providedIn: 'root',
})
export class Search {
  constructor(private http: HttpClient) { }

  search(query: string, apiUrl: string): Observable<SearchResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<SearchResponse>(
      apiUrl,
      { query },
      { headers }
    );
  }
}
