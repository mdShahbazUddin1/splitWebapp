import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetgroupComponent } from './getgroup.component';

describe('GetgroupComponent', () => {
  let component: GetgroupComponent;
  let fixture: ComponentFixture<GetgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetgroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
