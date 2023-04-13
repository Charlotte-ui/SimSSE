import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRegleDialogComponent } from './add-regle-dialog.component';

describe('AddRegleDialogComponent', () => {
  let component: AddRegleDialogComponent;
  let fixture: ComponentFixture<AddRegleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRegleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRegleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
