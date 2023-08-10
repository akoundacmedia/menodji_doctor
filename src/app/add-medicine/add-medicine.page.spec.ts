import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddMedicinePage } from './add-medicine.page';

describe('AddMedicinePage', () => {
  let component: AddMedicinePage;
  let fixture: ComponentFixture<AddMedicinePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMedicinePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddMedicinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
