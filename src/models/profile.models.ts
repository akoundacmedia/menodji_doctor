import { User } from './user.models';
import { Category } from './category.models';
import { Hospital } from './hospital.models';
import * as moment from 'moment';

export class Profile {
    id: number;
    name: string;
    tagline: string;
    details: string;
    meta: any;
    experience_years: number;
    fee: number;
    consultancy_fee: number;
    address: string;
    longitude: string;
    latitude: string;
    is_verified: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    image_urls: Array<string>;
    degrees: Array<Category>;
    specializations: Array<Category>;
    types: Array<Category>;
    services: Array<Category>;
    hospitals: Array<Hospital>;
    availability: Array<AvailabilityDateTime>;
    mediaurls: { images: Array<any> };
    user: User;

    static getDefault(): Profile {
        let toReturn = new Profile();
        toReturn.user = new User();
        toReturn.availability = AvailabilityDateTime.getDefault();
        toReturn.meta = {};
        return toReturn;
    }

    static getUpdateRequest(profile: Profile): ProfileUpateRequest {
        let pur = new ProfileUpateRequest();
        pur.name = profile.name;
        pur.tagline = profile.details;
        pur.details = profile.details;
        pur.experience_years = profile.experience_years;
        pur.image_urls = profile.image_urls;
        pur.fee = profile.fee;
        pur.hospitals = new Array();
        for (let hos of profile.hospitals) pur.hospitals.push({ id: hos.id, fee: profile.fee });
        pur.degrees = new Array();
        for (let cat of profile.degrees) pur.degrees.push(cat.id);
        pur.services = new Array();
        for (let cat of profile.services) pur.services.push(cat.id);
        pur.specializations = new Array();
        for (let cat of profile.specializations) pur.specializations.push(cat.id);
        pur.types = new Array();
        for (let cat of profile.types) pur.types.push(cat.id);
        pur.availability = new Array();
        for (let avail of profile.availability) if (avail.selected) pur.availability.push(AvailabilityDateTime.getRequest(avail));
        // profile.meta.national_id = "https://i.picsum.photos/id/242/200/300.jpg?hmac=_v7qaiV_fwDB3NP9lpirq7rMvS10u8lHjqMYNmmXya4";
        // profile.meta.doctor_licence = "https://i.picsum.photos/id/242/200/300.jpg?hmac=_v7qaiV_fwDB3NP9lpirq7rMvS10u8lHjqMYNmmXya4";
        // profile.meta.medical_council_reg = "https://i.picsum.photos/id/242/200/300.jpg?hmac=_v7qaiV_fwDB3NP9lpirq7rMvS10u8lHjqMYNmmXya4";
        pur.meta = JSON.stringify(profile.meta);
        return pur;
    }
}

export class ProfileUpateRequest {
    name: string;
    tagline: string;
    details: string;
    experience_years: number;
    address: string;
    latitude: string;
    longitude: string;
    fee: number;
    image_urls: Array<string>;
    hospitals: Array<{ id: number; fee: number; }>;
    degrees: Array<number>;
    services: Array<number>;
    specializations: Array<number>;
    types: Array<number>;
    availability: Array<{ days: string; from: string; to: string; }>;
    meta: string;
}

export class AvailabilityDateTime {
    days: string;
    from: string;
    to: string;
    selected: boolean;
    dateFromISO: string;
    dateToISO: string;

    constructor(days: string) {
        this.days = days;
        this.setTime("07:00:00", "21:00:00");
    }

    setTime(timeFrom: string, timeTo: string) {
        let momentStart = moment();
        let momentReturn = moment();
        let time_start_split = timeFrom.split(":");
        momentStart.set({ hour: Number(time_start_split[0]), minute: Number(time_start_split[1]), second: 0, millisecond: 0 });
        let time_return_split = timeTo.split(":");
        momentReturn.set({ hour: Number(time_return_split[0]), minute: Number(time_return_split[1]), second: 0, millisecond: 0 });
        this.dateFromISO = momentStart.format();
        this.dateToISO = momentReturn.format();
    }

    static getDefault(): Array<AvailabilityDateTime> {
        let toReturn = [
            new AvailabilityDateTime("mon"),
            new AvailabilityDateTime("tue"),
            new AvailabilityDateTime("wed"),
            new AvailabilityDateTime("thu"),
            new AvailabilityDateTime("fri"),
            new AvailabilityDateTime("sat"),
            new AvailabilityDateTime("sun")
        ];
        return toReturn;
    }

    static getRequest(adt: AvailabilityDateTime): { days: string; from: string; to: string; } {
        let momentFromDate = moment(adt.dateFromISO);
        let momentToDate = moment(adt.dateToISO);
        return { days: adt.days, from: momentFromDate.format("HH:mm"), to: momentToDate.format("HH:mm") };
    }
}
