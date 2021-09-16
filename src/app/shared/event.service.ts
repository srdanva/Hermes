import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface MeetingEvent {
    name: string;
    timeZone: string;
    description?: string;
    videoConferenceUrl: string;
    slug: string;
    startedAt: string;
    duration: number;
    id: number;
    endedAt: string;
    type: string;
    fullName?: string;
    finished: boolean;
    remainingTime: number;
    invitationSent: boolean;
    personalRendezVous: boolean;
    participant: {
        email: string;
        firstName: string;
        lastName: string;
        gender: string;
        fullName: string
    },
    creator: {
        email: string;
        firstName: string;
        lastName: string;
        gender: string;
        fullName: string
    }
    language: string;
}

export interface MeetingEventDto {
    name: string;
    startedAt: string;
    duration: number;
    email: string;
    fullName: string;
    gender: string;
    description?: string;
    dontSendInvitation: boolean;
    language: string;
}

@Injectable({
    providedIn: 'root'
})
export class EventService {
    baseUrl = `${environment.API_URL}/api`;
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    async getEvents(type?: 'e-meeting' | 'one-to-one') {
        let url: string;
        if (type === 'e-meeting') {
            url = `${this.baseUrl}/events?type=${type}`
        } else {
            url = `${this.baseUrl}/events`
        }
        return await this.http.get<MeetingEvent[]>(url, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    async findEvent(id: string) {
        return await this.http.get<MeetingEvent>(`${this.baseUrl}/events/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    async getEvent(meeting: MeetingEvent) {
        return await this.http.get<MeetingEvent>(`${this.baseUrl}/events/${meeting.id}`, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    async createEvent(eventDto: MeetingEventDto) {
        return await this.http.post<MeetingEvent>(`${this.baseUrl}/events`, eventDto, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    async sendAgain(meeting: MeetingEvent) {
        return await this.http.put(`${this.baseUrl}/events/${meeting.id}/resend-invitation`, {
            name: meeting.name,
            videoConferenceUrl: meeting.videoConferenceUrl,
            startedAt: meeting.startedAt,
            duration: meeting.duration
        }, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    async cancel(meeting: MeetingEvent) {
        return await this.http.delete(`${this.baseUrl}/events/${meeting.id}`,{
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }

    async createPressConferenceEvent(meetingId: number, data: { email: string; fullName: string; language: string; gender: string; dontSendInvitation: boolean; }) {
        return await this.http.put(`${this.baseUrl}/events/${meetingId}/invite-for-press-conference`, data, {
            headers: {
                'Authorization': `Bearer ${this.authService.getToken()}`,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).toPromise();
    }
}
