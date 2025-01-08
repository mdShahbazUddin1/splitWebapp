import { TestBed } from '@angular/core/testing';

import { UserCService } from './user-c.service';

describe('UserCService', () => {
  let service: UserCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
