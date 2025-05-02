// src/app/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://codegenie-sgqr.onrender.com'; // Adjust if deployed elsewhere

  constructor(private http: HttpClient) {}

  getModelSuggestions(selectedCollection: string, selectedmethodType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-model-suggestions`, { selectedCollection, selectedmethodType });
  }

  generateDescription(modelName: string, collectionType: string, methodType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate-description`, { modelName, collectionType, methodType });
  }

  generateSolution(modelName: string, collectionType: string, description: string, methodType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate-solution`, { modelName, collectionType, description, methodType });
  }

  generateTestCases(solution: string, collectionType: string, methodType: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/generate-testcases`, { solution, collectionType, methodType });
  }
}
