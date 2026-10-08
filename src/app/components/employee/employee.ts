import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
// import { any } from '../../app.model';
// import { any, any } from '../../app.model';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.html',
  styleUrl: './employee.css'
})
export class Employee {
  private http = inject(HttpClient);

  apiUrl = `${environment.apiUrl}/employees`;
  departmentApiUrl = `${environment.apiUrl}/departments`
  designationApiUrl = `${environment.apiUrl}/designations`

  employeeList: any[] = [];
  departmentList: any[] = [];
  designationList: any[] = [];
  filteredDesignationList:any[] = [];
  editid: number | null = null;
  showModal = false;
  nameError = '';
  emailError = '';
  phoneError = '';
  genderError = '';
  dateError = '';
  departmentError = '';
  designationError = '';

  isLoadingTableData = false;
  isDeletingData = false;
  isSavingData = false;
  

  // form fields
  fullName = '';
  email = '';
  phone = '';
  gender = 'Male';
  dateOfJoining = '';
  departmentid: number | null = null;
  designationid: number | null = null;
  employeeType = 'Permanent';
  salary = 0;
  

  constructor() {
    this.getDepartments();
    this.getDesignations(); 
  }

  getEmployees() {
    this.isLoadingTableData = true;
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      // Map department and designation names
      this.employeeList = res.map(emp => {
        const dept = this.departmentList.find(d => d._id === emp.departmentid);
        const des = this.designationList.find(ds => ds._id === emp.designationid);
        return {
          ...emp,
          departmentName: dept?.depName,
          designationName: des?.designationName
        };
      });
      this.isLoadingTableData = false;
    });
  }

  getDepartments() {
    this.http.get<any[]>(this.departmentApiUrl).subscribe(res => {
      this.departmentList = res;
      this.getEmployees();
    });
  }


  getDesignationsByDepartmentid() {
    this.filteredDesignationList = this.designationList.filter(
      des => des.departmentid === this.departmentid
    );
    this.getEmployees();
  }

  getDesignations() {
    this.http.get<any[]>(this.designationApiUrl).subscribe(res => {
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
    if (!this.departmentid) {
      this.departmentError = 'Department is required';
      return;
    }
    if (!this.designationid) {
      this.designationError = 'Designation is required';
      return;
    }
    if (!this.dateOfJoining) {
      this.dateError = 'Date of Joining is required';
      return;
    }

    this.isSavingData = true;

    const newEmp: any = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      gender: this.gender,
      dateOfJoining: this.dateOfJoining,
      departmentid: this.departmentid!,
      designationid: this.designationid!,
      employeeType: this.employeeType,
      salary: this.salary
    };

    if (this.editid) {
      this.http.put<any>(`${this.apiUrl}/${this.editid}`, newEmp).subscribe(() => {
        this.getEmployees();
        this.resetForm();
        this.isSavingData = false;
      });
    } else {
      this.http.post<any>(this.apiUrl, newEmp).subscribe(() => {
        this.getEmployees();
        this.resetForm();
        this.isSavingData = false;
      });
    }
  }

  onEdit(emp: any) {
    console.log(this.departmentid, this.designationid)
    this.editid = emp._id ?? null;
    this.fullName = emp.fullName;
    this.email = emp.email;
    this.phone = emp.phone;
    this.gender = emp.gender;
    this.dateOfJoining = emp.dateOfJoining;
    this.departmentid = emp.departmentid;
    this.filteredDesignationList = this.designationList.filter(
      des => des.departmentid === this.departmentid
    );
    this.designationid = emp.designationid;
    this.employeeType = emp.employeeType;
    this.salary = emp.salary;
  }

  onDelete(_id: number) {
    this.isDeletingData = true;
    this.http.delete(`${this.apiUrl}/${_id}`).subscribe(() => {
      this.getEmployees();
      this.isDeletingData = false;
    });
  }

  resetForm() {
    this.fullName = '';
    this.email = '';
    this.phone = '';
    this.gender = 'Male';
    this.dateOfJoining = '';
    this.departmentid = null;
    this.designationid = null;
    this.employeeType = 'Permanent';
    this.salary = 0;
    this.editid = null;
  }

  onAdd() {
    this.showModal = true;
    }
    onCancel() {
    this.showModal = false;
    this.resetForm();
    }
}
