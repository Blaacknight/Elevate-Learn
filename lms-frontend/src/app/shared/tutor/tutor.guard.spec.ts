import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { tutorGuard } from './tutor.guard';

describe('tutorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => tutorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
