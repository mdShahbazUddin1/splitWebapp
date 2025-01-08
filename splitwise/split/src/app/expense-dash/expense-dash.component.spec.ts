import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseDashComponent } from './expense-dash.component';

describe('ExpenseDashComponent', () => {
  let component: ExpenseDashComponent;
  let fixture: ComponentFixture<ExpenseDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
