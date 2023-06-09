import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarreOutilsComponent } from './barre-outils.component';

describe('BarreOutilsComponent', () => {
  let component: BarreOutilsComponent;
  let fixture: ComponentFixture<BarreOutilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarreOutilsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarreOutilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
