import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMultipleTrendsDialogComponent } from './add-multiple-trends-dialog.component';

describe('AddMultipleTrendsDialogComponent', () => {
  let component: AddMultipleTrendsDialogComponent;
  let fixture: ComponentFixture<AddMultipleTrendsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMultipleTrendsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMultipleTrendsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
