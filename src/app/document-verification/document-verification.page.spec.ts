import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentVerificationPage } from './document-verification.page';

describe('DocumentVerificationPage', () => {
  let component: DocumentVerificationPage;
  let fixture: ComponentFixture<DocumentVerificationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentVerificationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentVerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
