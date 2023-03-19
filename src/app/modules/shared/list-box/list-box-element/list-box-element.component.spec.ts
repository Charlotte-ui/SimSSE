import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBoxElementComponent } from './list-box-element.component';

describe('ListBoxElementComponent', () => {
  let component: ListBoxElementComponent;
  let fixture: ComponentFixture<ListBoxElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListBoxElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBoxElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
