import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface SearchResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    fullName: string;
}

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    baseUrl = `${environment.API_URL}/api`;
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    searchByEmailOrFullname(search: string, searchMethod: 'email' | 'full_name') {
        return this.http.get<SearchResponse[]>(`${this.baseUrl}/users/search?${searchMethod}=${search}`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    async sendSupportMessage(email: string, message: string) {
        return await this.http.post(`${this.baseUrl}/support-message`, { email, message }, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }
}
