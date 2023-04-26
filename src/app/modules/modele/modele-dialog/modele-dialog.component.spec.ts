import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeleDialogComponent } from './modele-dialog.component';

describe('ModeleDialogComponent', () => {
  let component: ModeleDialogComponent;
  let fixture: ComponentFixture<ModeleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
