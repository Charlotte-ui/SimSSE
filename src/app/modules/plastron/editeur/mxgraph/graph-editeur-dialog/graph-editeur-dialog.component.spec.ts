import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphEditeurDialogComponent } from './graph-editeur-dialog.component';

describe('GraphEditeurDialogComponent', () => {
  let component: GraphEditeurDialogComponent;
  let fixture: ComponentFixture<GraphEditeurDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphEditeurDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphEditeurDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
