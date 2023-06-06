import { TestBed } from '@angular/core/testing';

import { PlastronService } from './plastron.service';

describe('PlastronService', () => {
  let service: PlastronService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlastronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
