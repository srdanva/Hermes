import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaService {
    baseUrl = `${environment.API_URL}`;
    constructor(
        private httpClient: HttpClient,
        private authService: AuthService
    ) { }

    getMedia(url: string): Observable<Blob> {
        return this.httpClient.get(`${this.baseUrl}${url}`, {
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }
}   