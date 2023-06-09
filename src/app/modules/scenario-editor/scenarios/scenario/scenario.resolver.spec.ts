import { TestBed } from '@angular/core/testing';

import { ScenarioResolver } from './scenario.resolver';

describe('ScenarioResolver', () => {
  let resolver: ScenarioResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ScenarioResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
