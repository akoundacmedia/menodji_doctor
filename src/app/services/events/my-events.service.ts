import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs'; // For rxjs 6
import { AuthResponse } from 'src/models/auth-response.models';
import { User } from 'src/models/user.models';
import { Profile } from 'src/models/profile.models';
import { Appointment } from 'src/models/appointment.models';

@Injectable({
    providedIn: 'root'
})
export class MyEventsService {
    private unReadApIds = new BehaviorSubject<Array<number>>([]);
    private selectedLanguage = new Subject<string>();
    private authResponse = new Subject<AuthResponse>();
    // private authProfile = new Subject<Profile>();
    private appointment = new Subject<Appointment>();

    constructor() { }

    public getUnReadAppointmentIdsObservable(): Observable<Array<number>> {
        return this.unReadApIds.asObservable();
    }

    public setUnReadAppointmentIds(data: Array<string>) {
        let numberData = [];
        if (data && data.length) for (let d of data) numberData.push(Number(d));
        this.unReadApIds.next(numberData);
    }

    public getLanguageObservable(): Observable<string> {
        return this.selectedLanguage.asObservable();
    }

    public setLanguageData(data: string) {
        this.selectedLanguage.next(data);
    }

    public getLoginObservable(): Observable<AuthResponse> {
        return this.authResponse.asObservable();
    }

    public setLoginData(data: AuthResponse) {
        this.authResponse.next(data);
    }

    // public setProfileData(data: Profile) {
    //     this.authProfile.next(data);
    // }

    // public getProfileObservable(): Observable<Profile> {
    //     return this.authProfile.asObservable();
    // }
    public getAppointmentObservable(): Observable<Appointment> {
        return this.appointment.asObservable();
    }

    public setAppointmentData(data: Appointment) {
        this.appointment.next(data);
    }
}
