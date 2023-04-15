import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsDescriptionsComponent } from './tags-descriptions.component';

describe('TagsDescriptionsComponent', () => {
  let component: TagsDescriptionsComponent;
  let fixture: ComponentFixture<TagsDescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagsDescriptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagsDescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
