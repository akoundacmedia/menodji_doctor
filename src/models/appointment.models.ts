import { User } from './user.models';
import { Profile } from './profile.models';
import { OrderPayment } from './order-payment.models';

export class Appointment {
    id: number;
    meta: any;
    amount: number;
    amount_meta: any;
    address: string;
    address_meta: any;
    longitude: string;
    latitude: string;
    date: string;
    time_from: string;
    time_to: string;
    user: User;
    doctor: Profile;
    payment: OrderPayment;
    status: string;

    time_from_toshow: string;
    time_to_toshow: string;
    day_toshow: string;
    date_toshow: string;
    momentAppointment: any;
    type: string;
}