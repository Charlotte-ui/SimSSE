import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlastronComponent } from './plastron.component';

describe('PlastronComponent', () => {
  let component: PlastronComponent;
  let fixture: ComponentFixture<PlastronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlastronComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlastronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
