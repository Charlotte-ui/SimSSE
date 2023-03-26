import { TestBed } from '@angular/core/testing';

import { PlastronResolver } from './plastron.resolver';

describe('PlastronResolver', () => {
  let resolver: PlastronResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(PlastronResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
