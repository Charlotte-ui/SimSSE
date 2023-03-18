import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspecteurComponent } from './inspecteur.component';

describe('InspecteurComponent', () => {
  let component: InspecteurComponent;
  let fixture: ComponentFixture<InspecteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspecteurComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspecteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
