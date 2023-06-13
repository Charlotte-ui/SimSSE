import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MxgraphComponent } from './mxgraph.component';

describe('MxgraphComponent', () => {
  let component: MxgraphComponent;
  let fixture: ComponentFixture<MxgraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MxgraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MxgraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
