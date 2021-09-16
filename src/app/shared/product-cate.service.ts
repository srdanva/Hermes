import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface ProductCate {
    id: number;
    description: string;
    image: {
        createdAt: string;
        file: string;
        id: number;
        path: string;
        src: string;
        updatedAt: string;
    };
    products: string[]
}

@Injectable({ providedIn: 'root' })
export class ProductCateService {
    baseUrl = `${environment.API_URL}/api`;
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }
    getAllProductCates(): Promise<ProductCate[]> {
        return this.http.get<ProductCate[]>(`${this.baseUrl}/product_categories`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }
    getProductCate(id: number): Promise<ProductCate> {
        return this.http.get<ProductCate>(`${this.baseUrl}/product_categories/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }
}