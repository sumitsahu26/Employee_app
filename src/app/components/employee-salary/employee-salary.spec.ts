import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalary } from './employee-salary';

describe('EmployeeSalary', () => {
  let component: EmployeeSalary;
  let fixture: ComponentFixture<EmployeeSalary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSalary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
