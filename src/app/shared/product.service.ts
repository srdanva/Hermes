import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Product {
    mainImage: string;
    description: string;
    id: number;
    images: {
        createdAt: string;
        file: string;
        id: number;
        path: string;
        src: string;
        updatedAt: string;
        uuid: string;
        category: string
    }[];
    name: string;
    pdfs: {
        createdAt: string;
        file: string;
        id: number;
        image: {
            createdAt: string;
            file: string;
            id: number;
            path: string;
            src: string;
            updatedAt: string;
            uuid: string;
        };
        language: string;
        name: string;
        path: string;
        product: string;
        src: string;
        updatedAt: string;
        uuid: string;
    }[];
    productCategory: string;
    videos: {
        createdAt: string;
        file: string;
        id: number;
        image: {
            createdAt: string;
            file: string;
            id: number;
            path: string;
            src: string;
            updatedAt: string;
            uuid: string;
        };
        language: string;
        name: string;
        path: string;
        product: string;
        src: string;
        updatedAt: string;
        uuid: string;
    }[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    baseUrl = `${environment.API_URL}/api`;
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }
    getAllProducts(): Promise<Product[]> {
        return this.http.get<Product[]>(`${this.baseUrl}/products`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }
    getProduct(id: number): Promise<Product> {
        return this.http.get<Product>(`${this.baseUrl}/products/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }
}