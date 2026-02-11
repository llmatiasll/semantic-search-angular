import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Search } from '../services/search';
import { SearchResult } from '../models/search-result';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SearchBar implements OnInit, OnDestroy {
  @Input() apiUrl: string = 'http://localhost:3000/api/search';

  query: string = '';
  results: SearchResult[] = [];
  loading: boolean = false;
  isOpen: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  public constructor(private searchService: Search) { }

  public ngOnInit(): void {
    // Configurar debounce para búsqueda
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query = value;

    if (!value.trim()) {
      this.results = [];
      this.isOpen = false;
      return;
    }

    this.searchSubject.next(value);
  }

  public onFocus(): void {
    if (this.query) {
      this.isOpen = true;
    }
  }

  public clearSearch(): void {
    this.query = '';
    this.results = [];
    this.isOpen = false;
  }

  private performSearch(searchQuery: string): void {
    if (!searchQuery.trim()) {
      this.results = [];
      this.isOpen = false;
      return;
    }

    this.loading = true;
    this.isOpen = true;

    this.searchService.search(searchQuery, this.apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.results = response.results || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.results = [];
          this.loading = false;
        }
      });
  }

  public onResultClick(): void {
    this.isOpen = false;
  }

  public getRelevancePercentage(score: number): number {
    return Math.round(score * 100);
  }
}
