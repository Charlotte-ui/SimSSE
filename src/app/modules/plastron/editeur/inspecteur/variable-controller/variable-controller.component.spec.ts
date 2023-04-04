import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableControllerComponent } from './variable-controller.component';

describe('VariableControllerComponent', () => {
  let component: VariableControllerComponent;
  let fixture: ComponentFixture<VariableControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VariableControllerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariableControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
