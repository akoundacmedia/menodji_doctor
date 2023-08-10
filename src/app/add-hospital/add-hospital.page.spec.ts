import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddHospitalPage } from './add-hospital.page';

describe('AddHospitalPage', () => {
  let component: AddHospitalPage;
  let fixture: ComponentFixture<AddHospitalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHospitalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddHospitalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
