import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-report.html'
})
export class AttendanceReport {

  private http = inject(HttpClient);

  employeeApiUrl = `${environment.apiUrl}/employees`;
  attendanceApiUrl = `${environment.apiUrl}/employeeAttendance`;

  employeeList: any[] = [];
  attendanceList: any[] = [];
  filteredAttendanceList: any[] = [];

  searchText = '';
  filterEmployeeid: string | number | null = null;
  filterDate = '';

  constructor() {
    this.getEmployees();
  }

  getEmployees() {

    this.http.get<any[]>(this.employeeApiUrl).subscribe({
      next: (res) => {

        this.employeeList = res;

        this.getAttendance();

      },
      error: (err) => {

        console.error('Error fetching employees:', err);

      }
    });

  }

  getAttendance() {

    this.http.get<any[]>(this.attendanceApiUrl).subscribe({
      next: (res) => {

        this.attendanceList = res.map(item => {

          const employee = this.employeeList.find(
            emp => String(emp._id) === String(item.employeeid)
          );

          return {
            ...item,
            employeeName:
              employee?.fullName || 'Unknown Employee'
          };

        });

        this.filteredAttendanceList = [
          ...this.attendanceList
        ];

      },
      error: (err) => {

        console.error('Error fetching attendance:', err);

        this.attendanceList = [];
        this.filteredAttendanceList = [];

      }
    });

  }

  filterAttendance() {

    let result = [...this.attendanceList];

    // Employee filter
    if (this.filterEmployeeid !== null) {

      result = result.filter(
        item =>
          String(item.employeeid) ===
          String(this.filterEmployeeid)
      );

    }

    // Search
    if (this.searchText.trim()) {

      const search =
        this.searchText.trim().toLowerCase();

      result = result.filter(item =>
        item.employeeName
          ?.toLowerCase()
          .includes(search)
      );

    }

    // Date
    if (this.filterDate) {

      result = result.filter(
        item => item.date === this.filterDate
      );

    }

    this.filteredAttendanceList = result;

  }

  clearFilters() {

    this.searchText = '';
    this.filterEmployeeid = null;
    this.filterDate = '';

    this.filteredAttendanceList = [
      ...this.attendanceList
    ];

  }

  downloadExcel() {

    if (this.filteredAttendanceList.length === 0) {
      alert('No attendance data available to download');
      return;
    }
  
    const excelData = this.filteredAttendanceList.map(
      (attendance, index) => ({
        'SN': index + 1,
        'Employee Name': attendance.employeeName || '-',
        'Date': attendance.date || '-',
        'Status': attendance.status || '-',
        'In Time': attendance.inTime || '-',
        'Out Time': attendance.outTime || '-',
        'Remark': attendance.remark || '-'
      })
    );
  
    // Create worksheet
    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(excelData);
  
    // Create workbook
    const workbook: XLSX.WorkBook =
      XLSX.utils.book_new();
  
    // Add worksheet
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Attendance Report'
    );
  
    // Download Excel
    XLSX.writeFile(
      workbook,
      'Attendance_Report.xlsx'
    );
  }

}