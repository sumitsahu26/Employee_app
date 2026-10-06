import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-salary-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './salary-report.html'
})
export class SalaryReport {

  private http = inject(HttpClient);

  employeeApiUrl = `${environment.apiUrl}/employees`;
  ledgerApiUrl = `${environment.apiUrl}/salaryLedger`;
  attendanceApiUrl = `${environment.apiUrl}/employeeAttendance`;
  employeeSalaryApiUrl = `${environment.apiUrl}/employeeSalary`;

  employeeSalaryList: any[] = [];

  attendanceList: any[] = [];

  employeeList: any[] = [];
  ledgerList: any[] = [];

  salaryList: any[] = [];
  filteredSalaryList: any[] = [];

  searchText = '';
  filterMonth = '';

  constructor() {

    this.getEmployees();

  }

  getEmployees() {

    this.http.get<any[]>(
      this.employeeApiUrl
    ).subscribe({
      next: (res) => {
  
        this.employeeList = res;
  
        this.getAttendance();
  
      },
      error: (err) => {
        console.error(
          'Error fetching employees:',
          err
        );
      }
    });
  
  }

  getAttendance() {

    this.http.get<any[]>(
      this.attendanceApiUrl
    ).subscribe({
      next: (res) => {
  
        this.attendanceList = res;
  
        this.getLedger();
  
      },
      error: (err) => {
  
        console.error(
          'Error fetching attendance:',
          err
        );
  
        this.attendanceList = [];
  
        this.getLedger();
  
      }
    });
  
  }

  getLedger() {

    this.http.get<any[]>(
      this.ledgerApiUrl
    ).subscribe({
  
      next: (res) => {
  
        this.ledgerList = res;
  
        this.getEmployeeSalary();
  
      },
  
      error: (err) => {
  
        console.error(
          'Error fetching salary ledger:',
          err
        );
  
        this.ledgerList = [];
  
        this.getEmployeeSalary();
  
      }
  
    });
  
  }

  getEmployeeSalary() {

    this.http.get<any[]>(
      this.employeeSalaryApiUrl
    ).subscribe({
  
      next: (res) => {
  
        this.employeeSalaryList = res;
  
        this.createSalaryReport();
  
      },
  
      error: (err) => {
  
        console.error(
          'Error fetching employee salary:',
          err
        );
  
        this.employeeSalaryList = [];
  
        this.createSalaryReport();
  
      }
  
    });
  
  }

  createSalaryReport() {

    this.salaryList = this.employeeList
      .map(employee => {
  
        const employeeid = employee._id;
  
        // --------------------------------
        // Employee Ledger
        // --------------------------------
  
        const employeeLedger =
          this.ledgerList.filter(
            item =>
              String(item.employeeid) ===
              String(employeeid)
          );
  
  
        // --------------------------------
        // Check Transaction
        // --------------------------------
  
        const salaryTransactions =
          employeeLedger.filter(
            item =>
              item.transactionType === 'SALARY_PAYMENT' ||
              item.transactionType === 'ADVANCE'
          );
  
  
        // No transaction
        // Do not show employee
        if (salaryTransactions.length === 0) {
          return null;
        }
  
  
        // --------------------------------
        // Find Salary Month
        // --------------------------------
  
        let salaryMonth = '-';
  
        if (salaryTransactions.length > 0) {
  
          const latestTransaction =
            salaryTransactions.sort(
              (a, b) =>
                new Date(b.date).getTime() -
                new Date(a.date).getTime()
            )[0];
  
          if (latestTransaction?.date) {
            salaryMonth =
              latestTransaction.date.substring(0, 7);
          }
        }
  
  
        // --------------------------------
        // Attendance
        // --------------------------------
  
        const employeeAttendance =
          this.attendanceList?.filter(
            item =>
              String(item.employeeid) ===
              String(employeeid)
          ) || [];
  
  
        const presentDays =
          employeeAttendance.filter(
            item => item.status === 'Present'
          ).length;
  
  
        const absentDays =
          employeeAttendance.filter(
            item => item.status === 'Absent'
          ).length;
  
  
        const halfDays =
          employeeAttendance.filter(
            item => item.status === 'Half Day'
          ).length;
  
  
        const leaveDays =
          employeeAttendance.filter(
            item => item.status === 'Leave'
          ).length;
  
  
        // --------------------------------
        // Salary
        // --------------------------------
  
        const monthlySalary =
          Number(employee.salary || 0);
  
        const totalDays = 30;
  
        const dailySalary =
          Number(
            (monthlySalary / totalDays).toFixed(2)
          );
  
  
        // --------------------------------
        // Attendance Deduction
        // --------------------------------
  
        const absentDeduction =
          absentDays * dailySalary;
  
        const halfDayDeduction =
          halfDays * (dailySalary / 2);
  
        const leaveDeduction =
          leaveDays * dailySalary;
  
        const attendanceDeduction =
          absentDeduction +
          halfDayDeduction +
          leaveDeduction;
  
  
        // --------------------------------
        // Advance
        // --------------------------------
  
        const advances =
          employeeLedger.filter(
            item =>
              item.transactionType === 'ADVANCE'
          );
  
        const totalAdvance =
          advances.reduce(
            (total, item) =>
              total + Number(item.debit || 0),
            0
          );
  
  
        // --------------------------------
        // Salary Already Paid
        // --------------------------------
  
        const payments =
          employeeLedger.filter(
            item =>
              item.transactionType === 'SALARY_PAYMENT'
          );
  
        const totalPaid =
          payments.reduce(
            (total, item) =>
              total + Number(item.credit || 0),
            0
          );
  
  
        // --------------------------------
        // Remaining Salary
        // --------------------------------
  
        const salaryAfterAttendance =
          monthlySalary -
          attendanceDeduction;
  
        const remainingSalary =
          salaryAfterAttendance -
          totalAdvance -
          totalPaid;
  
  
        // --------------------------------
        // Report Object
        // --------------------------------
  
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
      .filter(item => item !== null);
  
  
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

    const [year, monthNumber] =
      month.split('-').map(Number);

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
  
    // -----------------------------
    // Employee Search
    // -----------------------------
  
    if (this.searchText.trim()) {
  
      const search =
        this.searchText
          .trim()
          .toLowerCase();
  
      result = result.filter(
        item =>
          item.employeeName
            ?.toLowerCase()
            .includes(search)
      );
  
    }
  
  
    // -----------------------------
    // Salary Month Filter
    // -----------------------------
  
    if (this.filterMonth) {
  
      result = result.filter(
        item =>
          item.salaryMonth === this.filterMonth
      );
  
    }
  
  
    this.filteredSalaryList = result;
  
  }

  clearFilters() {

    this.searchText = '';
  
    this.filterMonth = '';
  
    this.filteredSalaryList = [
      ...this.salaryList
    ];
  
  }

  downloadExcel() {

    if (this.filteredSalaryList.length === 0) {
  
      alert('No salary data available to download');
  
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
            Number(item.dailySalary || 0).toFixed(2),
  
          'Attendance Deduction':
            Number(item.attendanceDeduction || 0).toFixed(2),
  
          'Advance':
            Number(item.advance || 0).toFixed(2),
  
          'Paid Salary':
            Number(item.paidSalary || 0).toFixed(2),
  
          'Remaining Salary':
            Number(item.remainingSalary || 0).toFixed(2)
  
        })
      );
  
  
    // Create worksheet
    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );
  
  
    // Create workbook
    const workbook =
      XLSX.utils.book_new();
  
  
    // Add worksheet
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Salary Report'
    );
  
  
    // Download Excel
    XLSX.writeFile(
      workbook,
      'Salary_Report.xlsx'
    );
  
  }

}