import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Category } from 'src/models/category.models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-degre',
  templateUrl: './add-degre.page.html',
  styleUrls: ['./add-degre.page.scss']
})
export class AddDegrePage implements OnInit, OnDestroy {
  private subscriptions = new Array<Subscription>();
  private once = false;
  categories = new Array<Category>();
  toShow = new Array<Category>();
  isLoading = true;
  scope: string;
  selectedScope = new Array<Category>();
  // scope_page_title: string;
  // scope_hint_search: string;
  // scope_selection_message: string;
  //private scope: string;

  constructor(private navCtrl: NavController, private translate: TranslateService, private route: ActivatedRoute,
    private uiElementService: UiElementsService, private apiService: ApiService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.scope = params["scope"];
      this.selectedScope = params["selectedScope"];
      // this.loadCategories();

      // this.translate.get([(this.scope + "_scope_page_title"), (this.scope + "_scope_hint_search"), (this.scope + "_scope_selection_message")]).subscribe(values => {
      //   this.scope_page_title = values[(this.scope + "_scope_page_title")];
      //   this.scope_hint_search = values[(this.scope + "_scope_hint_search")];
      //   this.scope_selection_message = values[(this.scope + "_scope_selection_message")];
      //   this.loadCategories();
      // });
    });
  }

  ionViewDidEnter() {
    if (!this.once) {
      this.once = true;
      if (this.scope) this.loadCategories();
    }
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  private loadCategories() {
    this.translate.get(["loading", "empty_results"]).subscribe(values => {
      //this.uiElementService.presentLoading(values["loading"]);
      this.isLoading = true;
      this.apiService.getCategoriesWithScope(this.scope).subscribe(res => {
        for (let i in this.selectedScope) {
          for (let j in res) {
            if (Number(this.selectedScope[i]) == res[j].id) {
              res[j].selected = true;
            }
          }
        }
        this.categories = res;
        this.toShow = this.toShow.concat(res);
        this.isLoading = false;
        this.uiElementService.dismissLoading();
        if (!res || !res.length) {
          this.uiElementService.presentToast(values["empty_results"]);
          this.navCtrl.pop();
        }
      }, err => {
        console.log("getCategoriesWithScope", err);
        this.isLoading = false;
        this.uiElementService.dismissLoading();
        this.uiElementService.presentToast(values["empty_results"]);
        this.navCtrl.pop();
      });
    });
  }

  filterCategories(event) {
    this.toShow = [];
    if (event && event.detail && event.detail.value) {
      for (let hos of this.categories) if (hos.title.toLowerCase().includes(event.detail.value.toLowerCase())) this.toShow.push(hos);
    } else {
      this.toShow = this.toShow.concat(this.categories);
    }
  }

  saveSelection() {
    let hSelection = new Array<Category>();
    for (let hos of this.categories) if (hos.selected) hSelection.push(hos);
    if (!hSelection.length) {
      this.translate.get("no_selection").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      let hSelectionSave = { key: ("scope_" + this.scope), value: hSelection };
      window.localStorage.setItem("selection_temp", JSON.stringify(hSelectionSave));
      this.navCtrl.pop();
    }
  }

}
