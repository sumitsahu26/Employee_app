import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment.development';
// import { any, any, iEmployee } from '../../../app.model';

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './employee-report.html'
})
export class EmployeeReport {

  private http = inject(HttpClient);

  employeeApiUrl = `${environment.apiUrl}/employees`;
  departmentUrl = `${environment.apiUrl}/departments`
  designationUrl = `${environment.apiUrl}/designations`

  employeeList: any[] = [];
  filteredEmployeeList: any[] = [];
  departmentList: any[] = [];
  designationList: any[] = [];

  searchText = '';

  constructor() {
    this.getDepartments();
    this.getDesignations();
    this.getEmployees();
  }

  getDepartments() {
    this.http.get<any[]>(this.departmentUrl).subscribe(res => {
      this.departmentList = res;
      this.getEmployees();
    });
  }

  getDesignations() {
    this.http.get<any[]>(this.designationUrl).subscribe(res => {
      this.designationList = res;
      this.getEmployees()
    });
  }

  getEmployees() {

    this.http.get<any[]>(this.employeeApiUrl).subscribe({
      next: (res) => {

        this.employeeList = res.map(emp => {
          const dept = this.departmentList.find(d => d._id === emp.departmentid);
          const des = this.designationList.find(ds => ds._id === emp.designationid);
          return {
            ...emp,
            departmentName: dept?.depName,
            designationName: des?.designationName
          };
        });
        this.filteredEmployeeList = [...this.employeeList];

      },
      error: (err) => {

        console.error('Error fetching employees:', err);
        this.employeeList = [];
        this.filteredEmployeeList = [];

      }
    });

  }

  filterEmployees() {

    const search = this.searchText.trim().toLowerCase();

    if (!search) {

      this.filteredEmployeeList = [...this.employeeList];

      return;
    }

    this.filteredEmployeeList = this.employeeList.filter(
      employee =>
        employee.fullName?.toLowerCase().includes(search) ||
        employee.email?.toLowerCase().includes(search) ||
        employee.mobile?.toLowerCase().includes(search)
    );

  }

  clearSearch() {

    this.searchText = '';

    this.filteredEmployeeList = [...this.employeeList];

  }

  downloadExcel() {

    if (this.filteredEmployeeList.length === 0) {
      alert('No employee data available to download');
      return;
    }
  
    const excelData = this.filteredEmployeeList.map(
      (employee, index) => ({
        'SN': index + 1,
        'Employee Name': employee.fullName || '-',
        'Email': employee.email || '-',
        'Mobile': employee.phone || '-',
        'Department':
          employee.departmentName ||
          employee.department ||
          '-',
        'Designation':
          employee.designationName ||
          employee.designation ||
          '-',
        'Salary': employee.salary || 0
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
      'Employee Report'
    );
  
    // Download Excel
    XLSX.writeFile(
      workbook,
      'Employee_Report.xlsx'
    );
  }

}