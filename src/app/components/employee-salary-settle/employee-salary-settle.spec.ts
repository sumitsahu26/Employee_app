import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalarySettle } from './employee-salary-settle';

describe('EmployeeSalarySettle', () => {
  let component: EmployeeSalarySettle;
  let fixture: ComponentFixture<EmployeeSalarySettle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSalarySettle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalarySettle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
