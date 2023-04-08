import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabReglesComponent } from './tab-regles.component';

describe('TabReglesComponent', () => {
  let component: TabReglesComponent;
  let fixture: ComponentFixture<TabReglesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabReglesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabReglesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
