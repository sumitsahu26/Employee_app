import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryReport } from './salary-report';

describe('SalaryReport', () => {
  let component: SalaryReport;
  let fixture: ComponentFixture<SalaryReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
