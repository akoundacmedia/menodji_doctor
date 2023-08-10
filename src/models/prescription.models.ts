export class Prescription {
    title: string;
    medicines: Array<any>;
    notes: string;
    is_view: boolean;
}

export class AddMedicines {
    pill_name: string;
    days: Array<any>;
    times: Array<{ value: string }>;
}