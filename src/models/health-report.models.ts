export class HealthReport {
    title: string;
    bloodPressure: string;
    bodyTemperature: string;
    oxygenSaturation: string;
    glucoseLevel: string;
    allergies: string;
    medications: string;
    procedures: string;
    immunisations: string;
    weight: number;
    height: number;

    static isEmpty(toCheck: HealthReport): boolean {
        let toReturn = true;
        for (let key in toCheck) {
            if (toCheck[key] && String(toCheck[key]).length) {
                toReturn = false;
                break;
            }
        }
        return toReturn;
    }
}