import { Component, OnInit } from '@angular/core';
import { Helper } from 'src/models/helper.models';

@Component({
  selector: 'app-tnc',
  templateUrl: './tnc.page.html',
  styleUrls: ['./tnc.page.scss']
})
export class TncPage implements OnInit {
  privacy_policy: string;

  constructor() { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.privacy_policy = Helper.getSetting("terms");
  }

}
