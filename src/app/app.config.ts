import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    webApplicationId: string
}

export interface AppConfig {
    appName: string;
    apiBase: string;
    googleApiKey: string;
    oneSignalAppId: string;
    oneSignalGPSenderId: string;
    availableLanguages: Array<{ code: string, name: string }>;
    agoraVideoConfig: { enableAgoraVideo: boolean, agoraAppId: string };
    firebaseConfig: FirebaseConfig;
    demoMode: boolean;
    timeMode: string;
    demoLoginCredentials: { country: string, phoneNumber: string; otp: string; };
}

export const BaseAppConfig: AppConfig = {
    appName: "Menodj_Doctor",
    apiBase: "https://api.menodji.com/",
    googleApiKey: "AIzaSyBhKSmrgV5BWGBXqpC4lGur8ZDlcTLu2lA",
    oneSignalAppId: "YourOnesignalDoctorAppId",
    oneSignalGPSenderId: "xxxxxxxxxxxxx",
    agoraVideoConfig: { enableAgoraVideo: false, agoraAppId: "" },
    availableLanguages: [{
        code: 'en',
        name: 'English'
    }, {
        code: 'ar',
        name: 'عربى'
    }, {
        code: 'fr',
        name: 'français'
    }, {
        code: 'es',
        name: 'Española'
    }, {
        code: 'id',
        name: 'bahasa Indonesia'
    }, {
        code: 'pt',
        name: 'português'
    }, {
        code: 'tr',
        name: 'Türk'
    }, {
        code: 'it',
        name: 'Italiana'
    }, {
        code: 'sw',
        name: 'Kiswahili'
    }],
    demoMode: false,
    timeMode: "12", //12 or 24
    demoLoginCredentials: { country: "91", phoneNumber: "8787878787", otp: "123456" },
    firebaseConfig: {
        webApplicationId: "xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
        apiKey: "AIzaSyBhKSmrgV5BWGBXqpC4lGur8ZDlcTLu2lA",
        authDomain: "yourfirebaseappid.firebaseapp.com",
        databaseURL: "https://yourfirebaseappid.firebaseio.com",
        projectId: "yourfirebaseappid",
        storageBucket: "yourfirebaseappid.appspot.com",
        messagingSenderId: "xxxxxxxxxxxxx"
    }
};