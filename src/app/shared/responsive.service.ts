import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ResponsiveService {
    private isMobile = new Subject();
    private initMobileStatus: boolean;
    screenWidth: string;


    constructor() {
        this.checkWidth();
    }

    getInitMobileStatus() {
        const width = window.innerWidth;
        if (width < 768) {
            this.initMobileStatus = true;
        } else {
            this.initMobileStatus = false;
        }
        return this.initMobileStatus;
    }

    onMobileChange(status: boolean) {
        this.isMobile.next(status);
    }

    getMobileStatus(): Observable<any> {
        return this.isMobile.asObservable();
    }

    checkWidth() {
        // const orientation = window.orientation;
        const width = window.innerWidth;
        if (width < 768) {
            this.screenWidth = 'sm';
            this.onMobileChange(true);
        } else if (width >= 768 && width <= 992) {
            this.screenWidth = 'md';
            this.onMobileChange(false);
        } else {
            this.screenWidth = 'lg';
            this.onMobileChange(false);
        }
    }
}
