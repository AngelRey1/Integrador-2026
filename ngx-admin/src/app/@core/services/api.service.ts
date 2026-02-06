import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private buildUrl(path: string): string {
    // Si el path ya incluye la URL completa, usarlo tal cual
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Si el path ya empieza con /api, usarlo tal cual (para compatibilidad)
    if (path.startsWith('/api')) {
      return path;
    }
    // Construir URL completa
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  get<T = any>(path: string, params?: any, options?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }
    
    // Construir opciones de request asegurando que observe sea 'body'
    const requestOptions: { params: HttpParams; observe: 'body'; [key: string]: any } = { 
      params: httpParams,
      observe: 'body'
    };
    
    // Copiar otras opciones excepto observe (que siempre será 'body')
    if (options) {
      Object.keys(options).forEach(key => {
        if (key !== 'observe') {
          requestOptions[key] = options[key];
        }
      });
    }
    
    return this.http.get<T>(this.buildUrl(path), requestOptions);
  }

  post<T = any>(path: string, body: any): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body);
  }

  put<T = any>(path: string, body: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body);
  }

  patch<T = any>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(this.buildUrl(path), body);
  }

  delete<T = any>(path: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path));
  }
}
