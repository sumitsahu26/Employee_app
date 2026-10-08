import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';

import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-salary-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './salary-report.html'
})
export class SalaryReport {

  private http = inject(HttpClient);

  employeeApiUrl =
    `${environment.apiUrl}/employees`;

  ledgerApiUrl =
    `${environment.apiUrl}/salaryLedger`;

  attendanceApiUrl =
    `${environment.apiUrl}/employeeAttendance`;

  employeeSalaryApiUrl =
    `${environment.apiUrl}/employeeSalary`;

  employeeSalaryList: any[] = [];

  attendanceList: any[] = [];

  employeeList: any[] = [];

  ledgerList: any[] = [];

  salaryList: any[] = [];

  filteredSalaryList: any[] = [];

  searchText = '';

  filterMonth = '';


  isLoadingTableData = false;

  constructor() {

    this.loadSalaryReport();

  }

  loadSalaryReport() {

    this.isLoadingTableData = true;


    forkJoin({

      employees:
        this.http
          .get<any[]>(
            this.employeeApiUrl
          )
          .pipe(

            catchError(err => {

              console.error(
                'Error fetching employees:',
                err
              );

              return of([]);

            })

          ),

      attendance:
        this.http
          .get<any[]>(
            this.attendanceApiUrl
          )
          .pipe(

            catchError(err => {

              console.error(
                'Error fetching attendance:',
                err
              );

              return of([]);

            })

          ),

      ledger:
        this.http
          .get<any[]>(
            this.ledgerApiUrl
          )
          .pipe(

            catchError(err => {

              console.error(
                'Error fetching salary ledger:',
                err
              );

              return of([]);

            })

          ),

      employeeSalary:
        this.http
          .get<any[]>(
            this.employeeSalaryApiUrl
          )
          .pipe(

            catchError(err => {

              console.error(
                'Error fetching employee salary:',
                err
              );

              return of([]);

            })

          )

    }).subscribe({

      next: (result) => {

        this.employeeList =
          result.employees;

        this.attendanceList =
          result.attendance;

        this.ledgerList =
          result.ledger;

        this.employeeSalaryList =
          result.employeeSalary;

        this.createSalaryReport();

        this.isLoadingTableData = false;

      },

      error: (err) => {

        console.error(
          'Error loading salary report:',
          err
        );

        this.isLoadingTableData = false;

      }

    });

  }


  createSalaryReport() {

    this.salaryList =
      this.employeeList

        .map(employee => {

          const employeeid =
            employee._id;

          const employeeLedger =
            this.ledgerList.filter(
              item =>
                String(item.employeeid) ===
                String(employeeid)
            );

          const salaryTransactions =
            employeeLedger.filter(
              item =>
                item.transactionType ===
                'SALARY_PAYMENT' ||

                item.transactionType ===
                'ADVANCE'
            );

          if (
            salaryTransactions.length === 0
          ) {

            return null;

          }

          let salaryMonth = '-';


          if (
            salaryTransactions.length > 0
          ) {

            const latestTransaction =
              [...salaryTransactions].sort(
                (a, b) =>
                  new Date(b.date).getTime() -
                  new Date(a.date).getTime()
              )[0];


            if (
              latestTransaction?.date
            ) {

              salaryMonth =
                latestTransaction.date.substring(
                  0,
                  7
                );

            }

          }

          const employeeAttendance =
            this.attendanceList?.filter(
              item =>
                String(item.employeeid) ===
                String(employeeid)
            ) || [];


          const presentDays =
            employeeAttendance.filter(
              item =>
                item.status === 'Present'
            ).length;

          const absentDays =
            employeeAttendance.filter(
              item =>
                item.status === 'Absent'
            ).length;

          const halfDays =
            employeeAttendance.filter(
              item =>
                item.status === 'Half Day'
            ).length;

          const leaveDays =
            employeeAttendance.filter(
              item =>
                item.status === 'Leave'
            ).length;

          const monthlySalary =
            Number(
              employee.salary || 0
            );


          const totalDays = 30;


          const dailySalary =
            Number(
              (
                monthlySalary /
                totalDays
              ).toFixed(2)
            );

          const absentDeduction =
            absentDays *
            dailySalary;


          const halfDayDeduction =
            halfDays *
            (dailySalary / 2);


          const leaveDeduction =
            leaveDays *
            dailySalary;


          const attendanceDeduction =
            absentDeduction +
            halfDayDeduction +
            leaveDeduction;


          const advances =
            employeeLedger.filter(
              item =>
                item.transactionType ===
                'ADVANCE'
            );


          const totalAdvance =
            advances.reduce(
              (total, item) =>
                total +
                Number(
                  item.debit || 0
                ),
              0
            );

          const payments =
            employeeLedger.filter(
              item =>
                item.transactionType ===
                'SALARY_PAYMENT'
            );


          const totalPaid =
            payments.reduce(
              (total, item) =>
                total +
                Number(
                  item.credit || 0
                ),
              0
            );

          const salaryAfterAttendance =
            monthlySalary -
            attendanceDeduction;

          const remainingSalary =
            salaryAfterAttendance -
            totalAdvance -
            totalPaid;

          return {

            employeeid,

            employeeName:
              employee.fullName || '-',

            salaryMonth,

            monthlySalary,

            totalDays,

            presentDays,

            absentDays,

            halfDays,

            leaveDays,

            dailySalary,

            attendanceDeduction,

            advance:
              totalAdvance,

            paidSalary:
              totalPaid,

            remainingSalary:
              remainingSalary > 0
                ? remainingSalary
                : 0

          };

        })

        .filter(
          item =>
            item !== null
        );

    this.filteredSalaryList = [
      ...this.salaryList
    ];

  }


  getSalaryMonthName(
    month: string
  ): string {

    if (!month) {

      return '-';

    }


    const [
      year,
      monthNumber
    ] =
      month
        .split('-')
        .map(Number);


    const date =
      new Date(
        year,
        monthNumber - 1,
        1
      );


    return date.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  }


  filterSalary() {

    let result = [
      ...this.salaryList
    ];

    if (
      this.searchText.trim()
    ) {

      const search =
        this.searchText
          .trim()
          .toLowerCase();


      result =
        result.filter(
          item =>
            item.employeeName
              ?.toLowerCase()
              .includes(search)
        );

    }



    if (this.filterMonth) {

      result =
        result.filter(
          item =>
            item.salaryMonth ===
            this.filterMonth
        );

    }



    this.filteredSalaryList =
      result;

  }



  clearFilters() {

    this.searchText = '';

    this.filterMonth = '';


    this.filteredSalaryList = [
      ...this.salaryList
    ];

  }



  downloadExcel() {


    if (
      this.filteredSalaryList.length === 0
    ) {

      alert(
        'No salary data available to download'
      );

      return;

    }



    const excelData =
      this.filteredSalaryList.map(
        (item, index) => ({

          'SN':
            index + 1,

          'Employee Name':
            item.employeeName || '-',

          'Salary Month':
            item.salaryMonth || '-',

          'Monthly Salary':
            item.monthlySalary || 0,

          'Total Days':
            item.totalDays || 0,

          'Present Days':
            item.presentDays || 0,

          'Absent Days':
            item.absentDays || 0,

          'Half Days':
            item.halfDays || 0,

          'Leave Days':
            item.leaveDays || 0,

          'Daily Salary':
            Number(
              item.dailySalary || 0
            ).toFixed(2),

          'Attendance Deduction':
            Number(
              item.attendanceDeduction || 0
            ).toFixed(2),

          'Advance':
            Number(
              item.advance || 0
            ).toFixed(2),

          'Paid Salary':
            Number(
              item.paidSalary || 0
            ).toFixed(2),

          'Remaining Salary':
            Number(
              item.remainingSalary || 0
            ).toFixed(2)

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Salary Report'
    );

    XLSX.writeFile(
      workbook,
      'Salary_Report.xlsx'
    );

  }

}