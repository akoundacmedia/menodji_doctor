import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HealthReportPage } from './health-report.page';

describe('HealthReportPage', () => {
  let component: HealthReportPage;
  let fixture: ComponentFixture<HealthReportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthReportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
