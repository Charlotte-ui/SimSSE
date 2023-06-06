import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriageFilterComponent } from './triage-filter.component';

describe('TriageFilterComponent', () => {
  let component: TriageFilterComponent;
  let fixture: ComponentFixture<TriageFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriageFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriageFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
