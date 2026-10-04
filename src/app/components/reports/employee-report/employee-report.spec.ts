import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeReport } from './employee-report';

describe('EmployeeReport', () => {
  let component: EmployeeReport;
  let fixture: ComponentFixture<EmployeeReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
