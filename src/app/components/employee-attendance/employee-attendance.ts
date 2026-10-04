import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iEmployee } from '../../app.model';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.css'
})
export class EmployeeAttendance {
  private http = inject(HttpClient);

  // API URLs
  apiUrl = 'http://localhost:3000/employees';
  attendanceApiUrl = 'http://localhost:3000/employeeAttendance';

  // Employee list
  employeeList: iEmployee[] = [];

  // Attendance list
  attendanceList: any[] = [];

  // Form fields
  editId: number | null = null;
  employeeId: number | null = null;

  date: string = '';
  status: string = 'Present';
  inTime: string = '';
  outTime: string = '';
  remark: string = '';

  showModal = false;

  searchText = '';
  filterEmployeeId: string | number | null = null;
  filteredAttendanceList: any[] = [];
  filterDate = '';

  constructor() {
    this.getEmployees();
    this.getAttendance();
  }

  // Get employees
  getEmployees() {
    this.http.get<iEmployee[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.employeeList = res;

        // Get attendance again after employees are loaded
        this.getAttendance();
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  // Get attendance records
  getAttendance() {
    this.http.get<any[]>(this.attendanceApiUrl).subscribe({
      next: (res) => {
  
        this.attendanceList = res.map(attendance => {
  
          const employee = this.employeeList.find(
            emp => emp.id === attendance.employeeId
          );
  
          return {
            ...attendance,
            employeeName: employee?.fullName || 'Unknown Employee'
          };
  
        });
  
        this.filteredAttendanceList = [...this.attendanceList];
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
    if (this.filterEmployeeId !== null) {
      result = result.filter(
        item =>
          String(item.employeeId) === String(this.filterEmployeeId)
      );
    }
  
    // Employee search
    if (this.searchText.trim()) {
      const search = this.searchText.trim().toLowerCase();
  
      result = result.filter(item =>
        item.employeeName?.toLowerCase().includes(search)
      );
    }
  
    // Date filter
    if (this.filterDate) {
      result = result.filter(
        item => item.date === this.filterDate
      );
    }
  
    this.filteredAttendanceList = result;
  }

  clearFilters() {
    this.searchText = '';
    this.filterEmployeeId = null;
    this.filterDate = '';
  
    this.filteredAttendanceList = [...this.attendanceList];
  }

  // Save attendance
  saveAttendance() {

    if (!this.employeeId) {
      alert('Please select employee');
      return;
    }

    if (!this.date) {
      alert('Please select attendance date');
      return;
    }

    if (!this.status) {
      alert('Please select attendance status');
      return;
    }

    const attendanceData = {
      employeeId: this.employeeId,
      date: this.date,
      status: this.status,
      inTime: this.inTime,
      outTime: this.outTime,
      remark: this.remark
    };

    // Update
    if (this.editId !== null) {

      this.http
        .put(
          `${this.attendanceApiUrl}/${this.editId}`,
          {
            id: this.editId,
            ...attendanceData
          }
        )
        .subscribe({
          next: () => {
            this.getAttendance();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error updating attendance:', err);
          }
        });

    }

    // Add
    else {

      this.http
        .post(this.attendanceApiUrl, attendanceData)
        .subscribe({
          next: () => {
            this.getAttendance();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error adding attendance:', err);
          }
        });

    }
  }

  // Edit attendance
  onEdit(item: any) {

    this.editId = item.id ?? null;

    this.employeeId = item.employeeId;
    this.date = item.date;
    this.status = item.status;
    this.inTime = item.inTime;
    this.outTime = item.outTime;
    this.remark = item.remark;

    // On mobile open modal
    this.showModal = true;
  }

  // Delete attendance
  onDelete(id: number) {

    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    this.http
      .delete(`${this.attendanceApiUrl}/${id}`)
      .subscribe({
        next: () => {
          this.getAttendance();
        },
        error: (err) => {
          console.error('Error deleting attendance:', err);
        }
      });
  }

  // Reset form
  resetForm() {

    this.editId = null;

    this.employeeId = null;
    this.date = '';
    this.status = 'Present';
    this.inTime = '';
    this.outTime = '';
    this.remark = '';

    this.showModal = false;
  }

  // Add button
  onAdd() {

    this.resetForm();

    this.showModal = true;
  }

  // Cancel
  onCancel() {

    this.resetForm();
  }
}