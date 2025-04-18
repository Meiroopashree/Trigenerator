// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://ide-bbefdebbdfedacd323990932fbbecbcccedtwo.premiumproject.examly.io/proxy/3001'; // Adjust if deployed elsewhere

  constructor(private http: HttpClient) {}

  getModelSuggestions(selectedCollection: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-model-suggestions`, { selectedCollection });
  }

  generateDescription(modelName: string, collectionType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate-description`, { modelName, collectionType });
  }

  generateSolution(modelName: string, collectionType: string, description: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate-solution`, { modelName, collectionType, description });
  }

  generateTestCases(solution: string, collectionType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate-testcases`, { solution, collectionType });
  }
}
