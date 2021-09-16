import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    baseUrl = `${environment.API_URL}/api`;
    token: string;
    static TOKEN_KEY = '_tkn';
    constructor(
        private http: HttpClient,
        private router: Router
    ) { }
    isLoggedIn(): boolean {
        return !!sessionStorage.getItem(AuthService.TOKEN_KEY);
    }

    isGranted(role): boolean {
        const payload = this.getPayload();

        if (!payload) {
            return false;
        }

        return payload['roles'].includes(role);
    }

    getPayload(): Object {
        const token = this.getToken();

        if (!token) {
            return null;
        }

        const splitedToken = token.split('.');
        const payload = atob(splitedToken[1]);

        return JSON.parse(payload);
    }

    getEmail(): string {
        const payload = this.getPayload();

        if (payload) {
            return payload['email'];
        }

        return null;
    }

    getToken(): string {
        return sessionStorage.getItem(AuthService.TOKEN_KEY);
    }

    storeToken(token: string): void {
        sessionStorage.setItem(AuthService.TOKEN_KEY, token);
    }

    removeToken(): void {
        sessionStorage.removeItem(AuthService.TOKEN_KEY);
    }

    async login(loginCredentials: { email: string; password: string }) {
        if (!loginCredentials.password) {
            loginCredentials.password = 'fff';
        }
        const res = (await this.http.post<any>(`${this.baseUrl}/login`, loginCredentials).toPromise());
        if (res.token) {
            this.storeToken(res.token);
            if (this.isLoggedIn()) {
                this.router.navigateByUrl(`layout${location.search}`);
                return 'login';
            } else {
                this.router.navigateByUrl('main')
            }
        } else {
            if (res.user.isNew) {
                return 'newUser';
            }
        }
    }

    async setNewPassword(resetPassword: { email: string; password?: string }, token?: string) {
        const url = token ? `${this.baseUrl}/reset_password/${token}` : `${this.baseUrl}/request_password`;
        await this.http.post<any>(url, resetPassword, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    logout() {
        this.removeToken();
        this.router.navigateByUrl('main');
    }
}
