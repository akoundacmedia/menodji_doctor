import { Injectable, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from 'src/app/app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Country } from 'src/models/country.models';
import { AuthResponse } from 'src/models/auth-response.models';
import { SocialLoginRequest } from 'src/models/sociallogin-request.models';
import { SignUpRequest } from 'src/models/auth-signup-request.models';
import { MyMeta } from 'src/models/meta.models';
import { BaseListResponse } from 'src/models/base-list.models';
import { Helper } from 'src/models/helper.models';
import { Rating } from 'src/models/rating.models';
import { RatingSummary } from 'src/models/rating-summary.models';
import { SupportRequest } from 'src/models/support-request.models';
import { User } from 'src/models/user.models';
import { RateRequest } from 'src/models/rate-request.models';
import { Faq } from 'src/models/faq.models';
import { Profile, ProfileUpateRequest, AvailabilityDateTime } from 'src/models/profile.models';
import { Hospital } from 'src/models/hospital.models';
import { Category } from 'src/models/category.models';
import { Appointment } from 'src/models/appointment.models';
import * as moment from 'moment';
import { WalletTransaction } from 'src/models/wallet-transaction.models';
import { PayoutRequest } from 'src/models/payout-request.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private myHeaders: HttpHeaders;
  private profileMe: Profile;
  private uuid: string = "xxx";
  private platform: string = "android";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) { }

  setupHeaders(authToken?: string) {
    let tokenToUse = authToken ? authToken : Helper.getToken();
    let savedLanguageCode = Helper.getLanguageDefault();
    this.myHeaders = tokenToUse ? new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': ('Bearer ' + tokenToUse),
      'X-Localization': String(savedLanguageCode ? savedLanguageCode : this.config.availableLanguages[0].code),
      'X-Device-Id': this.uuid ? this.uuid : "xxx",
      'X-Device-Type': this.platform ? this.platform : "android"
    }) : new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Localization': String(savedLanguageCode ? savedLanguageCode : this.config.availableLanguages[0].code),
      'X-Device-Id': this.uuid ? this.uuid : "xxx",
      'X-Device-Type': this.platform ? this.platform : "android"
    });
  }


  setUuidAndPlatform(uuid: string, platform: string) {
    this.uuid = uuid;
    this.platform = platform ? String(platform).toLowerCase() : platform;
    this.setupHeaders();
  }

  public getAgoraRtcToken(channelName: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.config.apiBase + 'api/agora/token?token_type=rtc', { channel: channelName }, { headers: this.myHeaders });
  }

  public getAgoraRtmToken(userId: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.config.apiBase + 'api/agora/token?token_type=rtm', { uid: userId }, { headers: this.myHeaders });
  }

  public getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>('./assets/json/countries.json').pipe(
      tap(data => {
        let indiaIndex = -1;
        // if (data) {
        //   for (let i = 0; i < data.length; i++) {
        //     if (data[i].name == "India") {
        //       indiaIndex = i;
        //       break;
        //     }
        //   }
        // }
        if (indiaIndex != -1) data.unshift(data.splice(indiaIndex, 1)[0]);
      }),
      catchError(this.handleError<Array<Country>>('getCountries', []))
    );
  }

  public setProfileToUse(pro: Profile) {
    this.profileMe = pro;
  }

  public getProfileToUse(): Profile {
    return this.profileMe;
  }

  public postNotificationContent(roleTo: string, userIdTo: string, title?: string, body?: string): Observable<any> {
    let urlParams = new URLSearchParams();
    if (title && title.length) urlParams.append("message_title", title);
    if (body && body.length) urlParams.append("message_body", body);
    return this.http.post<any>(this.config.apiBase + 'api/user/push-notification?' + urlParams.toString(), { role: roleTo, user_id: userIdTo }, { headers: this.myHeaders });
  }

  public getURL(url: string): Observable<any> {
    return this.http.get<any>(url, { headers: this.myHeaders });
  }

  public getContactLink(): Observable<{ link: string }> {
    return this.http.get<{ link: string }>('https://dashboard.vtlabs.dev/whatsapp.php?product_name=doctorworld&source=application', { headers: this.myHeaders });
  }

  public getSettings(): Observable<Array<MyMeta>> {
    return this.http.get<Array<MyMeta>>(this.config.apiBase + 'api/settings', { headers: this.myHeaders });
  }

  public submitSupport(supportRequest: SupportRequest): Observable<{}> {
    return this.http.post<{}>(this.config.apiBase + "api/support", supportRequest, { headers: this.myHeaders });
  }

  public checkUser(checkUserRequest: any): Observable<{}> {
    return this.http.post<{}>(this.config.apiBase + 'api/check-user', checkUserRequest, { headers: this.myHeaders });
  }

  public loginSocial(socialLoginRequest: SocialLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.config.apiBase + 'api/social/login', socialLoginRequest, { headers: this.myHeaders }).pipe(tap(data => this.setupUserMe(data.user)));
  }

  public loginUser(loginTokenRequest: { token: string, role: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.config.apiBase + 'api/login', loginTokenRequest, { headers: this.myHeaders }).pipe(tap(data => this.setupUserMe(data.user)));
  }

  public createUser(signUpRequest: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.config.apiBase + 'api/register', signUpRequest, { headers: this.myHeaders }).pipe(tap(data => this.setupUserMe(data.user)));
  }

  public updateUser(updateRequest): Observable<User> {
    return this.http.put<User>(this.config.apiBase + 'api/user', updateRequest, { headers: this.myHeaders }).pipe(tap(data => this.setupUserMe(data)));
  }

  public walletTransfer(wtr: PayoutRequest): Observable<any> {
    return this.http.post<any>(this.config.apiBase + 'api/user/wallet/payout', wtr, { headers: this.myHeaders });
  }

  public getRatings(userId): Observable<Rating> {
    return this.http.get<Rating>(this.config.apiBase + "api/doctor/profile/ratings/summary/" + userId, { headers: this.myHeaders }).pipe(tap(data => {
      let ratingSummaries = RatingSummary.defaultArray();
      for (let ratingSummaryResult of data.summary) {
        ratingSummaries[ratingSummaryResult.rounded_rating - 1].total = ratingSummaryResult.total;
        ratingSummaries[ratingSummaryResult.rounded_rating - 1].percent = ((ratingSummaryResult.total / data.total_ratings) * 100);
      }
      data.summary = ratingSummaries;
      data.average_rating = Number(data.average_rating).toFixed(2);
    }));
  }

  public getReviews(usrId, pageNo: number): Observable<BaseListResponse> {
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/doctor/profile/ratings/" + usrId + "?page=" + pageNo, { headers: this.myHeaders }).pipe(tap(data => {
      let locale = Helper.getLocale();
      for (let review of data.data) { review.created_at = Helper.formatTimestampDate(review.created_at, locale); review.rating = Number(Number(review.rating).toFixed(1)); if (review.user) this.setupUserMe(review.user) }
    }));
  }

  public getFaqs(): Observable<Array<Faq>> {
    return this.http.get<Array<Faq>>(this.config.apiBase + 'api/faq', { headers: this.myHeaders });
  }

  public getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.config.apiBase + "api/doctor/profile", { headers: this.myHeaders }).pipe(tap(data => this.setupProfile(data)));
  }

  public getHospitals(): Observable<BaseListResponse> {
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/doctor/hospitals", { headers: this.myHeaders });
  }

  public getCategoriesWithScope(scope: string): Observable<Array<Category>> {
    return this.http.get<Array<Category>>(this.config.apiBase + "api/categories?pagination=0&scope=" + scope, { headers: this.myHeaders }).pipe(tap(data => {
      if (data && data.length) for (let cat of data) this.setupCategory(cat);
    })
      //, catchError(this.handleError<Array<Category>>('getCategoriesWithScope', this.getTestCategories()))
    );
  }

  public rateUser(uId: number, rateRequest: RateRequest): Observable<{}> {
    return this.http.post<{}>(this.config.apiBase + "api/user/ratings/" + uId, JSON.stringify(rateRequest), { headers: this.myHeaders });
  }

  public updateProfile(pur: any): Observable<Profile> {
    return this.http.put<Profile>(this.config.apiBase + "api/doctor/profile", JSON.stringify(pur), { headers: this.myHeaders }).pipe(tap(data => this.setupProfile(data)));
  }

  private setupCategory(category: Category) {
    if (category.mediaurls && category.mediaurls.images) for (let imgObj of category.mediaurls.images) if (imgObj["default"]) { category.image = imgObj["default"]; break; }
    if (!category.image) category.image = "assets/images/empty_vendor_profile_image.png";
  }

  public getAppointments(userId, pageNo): Observable<BaseListResponse> {
    let urlParams = new URLSearchParams();
    urlParams.append("appointee", String(userId));
    if (pageNo) urlParams.append("page", String(pageNo));
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/doctor/appointments?" + urlParams.toString(), { headers: this.myHeaders }).pipe(tap(data => {
      if (data && data.data) this.setupAppointmentRemoveUnfilled(data.data);
      let locale = Helper.getLocale();
      for (let ap of data.data) this.setupAppointment(ap);
    }));
  }

  public getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(this.config.apiBase + 'api/user/wallet/balance', { headers: this.myHeaders }).pipe(tap(data => {
      if (!data.balance) data.balance = 0;
      data.balance = Number(data.balance.toFixed(2));
    }));
  }

  public getTransactions(): Observable<BaseListResponse> {
    return this.http.get<BaseListResponse>(this.config.apiBase + 'api/user/wallet/transactions', { headers: this.myHeaders }).pipe(tap(data => {
      if (data && data.data && data.data.length) for (let trans of data.data) this.setupTransaction(trans);
    }));
  }

  public updateAppointment(apId, ur): Observable<Appointment> {
    return this.http.put<Appointment>(this.config.apiBase + "api/doctor/appointments/" + apId, ur, { headers: this.myHeaders }).pipe(tap(ap => this.setupAppointment(ap)));
  }

  private setupAppointmentRemoveUnfilled(data: Array<Appointment>) {
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (!data[i].doctor || !data[i].doctor.hospitals) {
        // if (!data[i].doctor || !data[i].doctor.hospitals || !data[i].payment || !data[i].payment.status || data[i].payment.status != "paid") {
        found = true;
        data.splice(i, 1);
      }
    }
    if (found) this.setupAppointmentRemoveUnfilled(data);
  }

  public setupTransaction(transaction: WalletTransaction) {
    transaction.created_at = Helper.formatTimestampDateTime(transaction.created_at, "en");
    transaction.updated_at = Helper.formatTimestampDateTime(transaction.updated_at, "en");
    if (!transaction.amount) transaction.amount = 0;
    transaction.amount = Number(transaction.amount.toFixed(2));
    if (transaction.meta && transaction.meta.source_amount) transaction.meta.source_amount = Number(Number(transaction.meta.source_amount).toFixed(2));
  }

  private setupAppointment(data: Appointment) {
    if (!data.meta) data.meta = {};
    if (!data.status) data.status = "pending";
    data.momentAppointment = moment(data.date + " " + data.time_from);

    data.day_toshow = String(data.momentAppointment.format("ddd")).toLowerCase();
    data.date_toshow = data.momentAppointment.format("Do MMM");
    let timeFromSplit = data.time_from.split(":");
    let timeToSplit = data.time_to.split(":");
    data.time_from_toshow = timeFromSplit[0] + ":" + timeFromSplit[1];
    data.time_to_toshow = timeToSplit[0] + ":" + timeToSplit[1];
    this.setupProfile(data.doctor);

    if (!data.user) data.user = new User();
    if (data.user.mediaurls && data.user.mediaurls.images) for (let imgObj of data.user.mediaurls.images) if (imgObj["default"]) { data.user.image_url = imgObj["default"]; break; }
    if (!data.user.image_url) data.user.image_url = "assets/images/empty_dp.png";
  }

  private setupUserMe(data) {
    if (!data.mediaurls || !data.mediaurls.images) data.mediaurls = { images: [] };
    if (!data.image_url) for (let imgObj of data.mediaurls.images) if (imgObj["default"]) { data.image_url = imgObj["default"]; break; }
  }

  private setupProfile(data: Profile) {
    if (!data.fee) data.fee = (data.hospitals && data.hospitals.length > 0) ? data.hospitals[0].fee : 0;
    if (!data.is_verified) data.is_verified = 0;

    if (!data.mediaurls || !data.mediaurls.images) data.mediaurls = { images: [] };
    data.image_urls = [];
    if (data.mediaurls && data.mediaurls.images) for (let imgObj of data.mediaurls.images) if (imgObj["default"]) { data.image_urls.push(imgObj["default"]); break; }

    if (!data.user) data.user = new User();
    if (data.user.mediaurls && data.user.mediaurls.images) for (let imgObj of data.user.mediaurls.images) if (imgObj["default"]) { data.user.image_url = imgObj["default"]; break; }
    if (!data.user.image_url) data.user.image_url = "assets/images/empty_dp.png";

    let availabilityDefault = AvailabilityDateTime.getDefault();
    if (data.availability && data.availability.length) {
      for (let avail of data.availability) {
        let index = 0;
        switch (avail.days) {
          case "mon":
            index = 0;
            break;
          case "tue":
            index = 1;
            break;
          case "wed":
            index = 2;
            break;
          case "thu":
            index = 3;
            break;
          case "fri":
            index = 4;
            break;
          case "sat":
            index = 5;
            break;
          case "sun":
            index = 6;
            break;
        }
        availabilityDefault[index].selected = true;
        availabilityDefault[index].setTime(avail.from, avail.to);
      }
    }
    data.availability = availabilityDefault;
    if (typeof data.meta == "string") data.meta = JSON.parse(data.meta as string);
    if (!data.meta || Array.isArray(data.meta)) data.meta = {};
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
