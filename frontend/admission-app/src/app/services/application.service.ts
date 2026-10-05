import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationResponse } from '../models/application';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:5000/api/applications';

  constructor(private http: HttpClient) {}

  submitApplication(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  getApplications(): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(this.apiUrl);
  }

  getApplicationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateApplicationStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status });
  }
}
