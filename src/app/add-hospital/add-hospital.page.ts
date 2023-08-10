import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Hospital } from 'src/models/hospital.models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-hospital',
  templateUrl: './add-hospital.page.html',
  styleUrls: ['./add-hospital.page.scss']
})
export class AddHospitalPage implements OnInit, OnDestroy {
  private subscriptions = new Array<Subscription>();
  public hospitals = new Array<Hospital>();
  toShow = new Array<Hospital>();
  isLoading = true;
  selectedHospitals = new Array<any>();

  constructor(private navCtrl: NavController, private translate: TranslateService, private route: ActivatedRoute,
    private uiElementService: UiElementsService, private apiService: ApiService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedHospitals = params["selectedHospitals"];
    });
  }

  ionViewWillEnter() {
    this.loadHospitals();
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  loadHospitals() {
    this.translate.get("loading").subscribe(value => {
      this.isLoading = true;
      // this.uiElementService.presentLoading(value);
      this.apiService.getHospitals().subscribe(res => {
        for (let i in this.selectedHospitals) {
          for (let j in res.data) {
            if (Number(this.selectedHospitals[i]) == res.data[j].id) {
              res.data[j].selected = true;
            }
          }
        }
        this.hospitals = res.data;
        this.toShow = this.toShow.concat(res.data);
        this.uiElementService.dismissLoading();
        this.isLoading = false;
      }, err => {
        console.log("getHospitals", err);
        this.uiElementService.dismissLoading();
        this.isLoading = false;
      });
    });
  }

  filterHospitals(event) {
    this.toShow = [];
    if (event && event.detail && event.detail.value) {
      for (let hos of this.hospitals) if (hos.name.toLowerCase().includes(event.detail.value.toLowerCase()) || hos.address.toLowerCase().includes(event.detail.value.toLowerCase()) || hos.details.toLowerCase().includes(event.detail.value.toLowerCase())) this.toShow.push(hos);
    } else {
      this.toShow = this.toShow.concat(this.hospitals);
    }
  }

  saveSelection() {
    let hSelection = new Array<Hospital>();
    for (let hos of this.hospitals) if (hos.selected) hSelection.push(hos);
    if (!hSelection.length) {
      this.translate.get("no_selection").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      let hSelectionSave = { key: "hospitals", value: hSelection };
      window.localStorage.setItem("selection_temp", JSON.stringify(hSelectionSave));
      this.navCtrl.pop();
    }
  }

}
