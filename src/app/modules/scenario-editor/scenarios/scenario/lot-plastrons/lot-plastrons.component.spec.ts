import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotPlastronsComponent } from './lot-plastrons.component';

describe('LotPlastronsComponent', () => {
  let component: LotPlastronsComponent;
  let fixture: ComponentFixture<LotPlastronsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LotPlastronsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotPlastronsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
