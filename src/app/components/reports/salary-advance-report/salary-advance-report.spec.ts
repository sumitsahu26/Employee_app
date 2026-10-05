import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryAdvanceReport } from './salary-advance-report';

describe('SalaryAdvanceReport', () => {
  let component: SalaryAdvanceReport;
  let fixture: ComponentFixture<SalaryAdvanceReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryAdvanceReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryAdvanceReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
