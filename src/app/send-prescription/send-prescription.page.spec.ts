import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SendPrescriptionPage } from './send-prescription.page';

describe('SendPrescriptionPage', () => {
  let component: SendPrescriptionPage;
  let fixture: ComponentFixture<SendPrescriptionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendPrescriptionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SendPrescriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
