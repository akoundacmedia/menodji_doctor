import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddDegrePage } from './add-degre.page';

describe('AddDegrePage', () => {
  let component: AddDegrePage;
  let fixture: ComponentFixture<AddDegrePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDegrePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddDegrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
