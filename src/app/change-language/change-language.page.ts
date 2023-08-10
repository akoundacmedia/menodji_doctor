import { Component, OnInit, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../app.config';
import { Constants } from 'src/models/constants.models';
import { MyEventsService } from '../services/events/my-events.service';

@Component({
  selector: 'app-change-language',
  templateUrl: './change-language.page.html',
  styleUrls: ['./change-language.page.scss']
})
export class ChangeLanguagePage implements OnInit {
  defaultLanguageCode;
  languages: Array<{ code: string, name: string }>;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private myEvent: MyEventsService) {
  }

  ngOnInit() {
    this.languages = this.config.availableLanguages;
    this.defaultLanguageCode = this.config.availableLanguages[0].code;
    let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    if (defaultLang) this.defaultLanguageCode = defaultLang;
  }

  onLanguageClick(language) {
    this.defaultLanguageCode = language.code;
  }

  languageConfirm() {
    window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, this.defaultLanguageCode);
    this.myEvent.setLanguageData(this.defaultLanguageCode);
  }

}