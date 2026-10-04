import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { iEmployee } from '../../app.model';
import { iDepartment, iDesignation } from '../../app.model';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css'
})
export class Employee {
  private http = inject(HttpClient);

  apiUrl = 'http://localhost:3000/employees';

  employeeList: iEmployee[] = [];
  departmentList: iDepartment[] = [];
  designationList: iDesignation[] = [];
  filteredDesignationList:iDesignation[] = [];
  editId: number | null = null;
  showModal = false;
  nameError = '';
  emailError = '';
  phoneError = '';
  genderError = '';
  dateError = '';
  departmentError = '';
  designationError = '';
  

  // form fields
  fullName = '';
  email = '';
  phone = '';
  gender = 'Male';
  dateOfJoining = '';
  departmentId: number | null = null;
  designationId: number | null = null;
  employeeType = 'Permanent';
  salary = 0;
  

  constructor() {
    this.getDepartments();
    this.getDesignations(); 
  }

  getEmployees() {
    this.http.get<iEmployee[]>(this.apiUrl).subscribe(res => {
      // Map department and designation names
      this.employeeList = res.map(emp => {
        const dept = this.departmentList.find(d => d.id === emp.departmentId);
        const des = this.designationList.find(ds => ds.id === emp.designationId);
        return {
          ...emp,
          departmentName: dept?.depName,
          designationName: des?.designationName
        };
      });
    });
  }

  getDepartments() {
    this.http.get<iDepartment[]>('http://localhost:3000/departments').subscribe(res => {
      this.departmentList = res;
      this.getEmployees();
    });
  }

  getDesignationsByDepartmentId() {
    this.filteredDesignationList = this.designationList.filter(
      des => des.departmentId === this.departmentId
    );
    this.getEmployees();
  }

  getDesignations() {
    this.http.get<iDesignation[]>('http://localhost:3000/designations').subscribe(res => {
      this.designationList = res;
      this.getEmployees()
    });
  }

  saveEmployee() {
    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';
    this.genderError = '';
    this.dateError = '';
    this.departmentError = '';
    this.designationError = '';

    if (!this.fullName) {
      this.nameError = 'Full Name is required';
      return;
    }
    if (!this.email) {
      this.emailError = 'Email is required';
      return;
    }
    if (!this.phone) {
      this.phoneError = 'Phone is required';
      return;
    }
    if (!this.gender) {
      this.genderError = 'Department is required';
      return;
    }
    if (!this.departmentId) {
      this.departmentError = 'Department is required';
      return;
    }
    if (!this.designationId) {
      this.designationError = 'Designation is required';
      return;
    }
    if (!this.dateOfJoining) {
      this.dateError = 'Date of Joining is required';
      return;
    }

    const newEmp: iEmployee = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      gender: this.gender,
      dateOfJoining: this.dateOfJoining,
      departmentId: this.departmentId!,
      designationId: this.designationId!,
      employeeType: this.employeeType,
      salary: this.salary
    };

    if (this.editId) {
      this.http.put<iEmployee>(`${this.apiUrl}/${this.editId}`, newEmp).subscribe(() => {
        this.getEmployees();
        this.resetForm();
      });
    } else {
      this.http.post<iEmployee>(this.apiUrl, newEmp).subscribe(() => {
        this.getEmployees();
        this.resetForm();
      });
    }
  }

  onEdit(emp: iEmployee) {
    this.editId = emp.id ?? null;
    this.fullName = emp.fullName;
    this.email = emp.email;
    this.phone = emp.phone;
    this.gender = emp.gender;
    this.dateOfJoining = emp.dateOfJoining;
    this.departmentId = emp.departmentId;
    this.designationId = emp.designationId;
    this.employeeType = emp.employeeType;
    this.salary = emp.salary;
  }

  onDelete(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.getEmployees();
    });
  }

  resetForm() {
    this.fullName = '';
    this.email = '';
    this.phone = '';
    this.gender = 'Male';
    this.dateOfJoining = '';
    this.departmentId = null;
    this.designationId = null;
    this.employeeType = 'Permanent';
    this.salary = 0;
  }

  onAdd() {
    this.showModal = true;
    }
    onCancel() {
    this.showModal = false;
    this.resetForm();
    }
}
