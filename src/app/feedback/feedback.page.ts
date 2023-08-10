import { Component, OnInit } from '@angular/core';
import { Rating } from 'src/models/rating.models';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Review } from 'src/models/review.models';
import { Profile } from 'src/models/profile.models';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss']
})
export class FeedbackPage implements OnInit {
  private subscriptions: Array<Subscription> = [];
  private pageNo = 1;
  private doneAllReviews = false;
  private infiniteScrollEvent;
  isLoading = true;
  rating: Rating;
  reviews: Array<Review> = [];
  profileMe: Profile;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    // this.rating = JSON.parse(window.localStorage.getItem(Constants.KEY_RATING_SUMMARY));
    if (!this.rating) this.rating = Rating.getDefault();
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    // this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.pageNo = 1;
    this.profileMe = this.apiService.getProfileToUse();
    if (this.profileMe != null) { this.loadRatings(); this.reviews = []; this.loadReviews(); }
  }

  loadRatings() {
    this.apiService.getRatings(this.profileMe.id).subscribe(res => {
      this.rating = res;
      // window.localStorage.setItem(Constants.KEY_RATING_SUMMARY, JSON.stringify(res));
    }, err => {
      console.log('rating_err', err);
    });
  }

  loadReviews() {
    this.subscriptions.push(this.apiService.getReviews(this.profileMe.id, this.pageNo).subscribe(res => {
      this.reviews = this.reviews.concat(res.data);
      this.doneAllReviews = (!res.data || !res.data.length);
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      this.isLoading = false;
    }, err => {
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      console.log("getReviews", err);
      this.isLoading = false;
    }));
  }

  doInfiniteReviews(event) {
    if (this.doneAllReviews) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.pageNo = this.pageNo + 1;
      this.loadReviews();
    }
  }

}
