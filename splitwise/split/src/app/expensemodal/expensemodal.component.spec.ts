import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensemodalComponent } from './expensemodal.component';

describe('ExpensemodalComponent', () => {
  let component: ExpensemodalComponent;
  let fixture: ComponentFixture<ExpensemodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensemodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensemodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
