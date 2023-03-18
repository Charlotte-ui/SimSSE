import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditeurGrapheNodalComponent } from './editeur-graphe-nodal.component';

describe('EditeurGrapheNodalComponent', () => {
  let component: EditeurGrapheNodalComponent;
  let fixture: ComponentFixture<EditeurGrapheNodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditeurGrapheNodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditeurGrapheNodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
