import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.development';
// import { any, iSalary, any } from '../../app.model';

@Component({
  selector: 'app-employee-salary-settle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'employee-salary-settle.html',
  styleUrl: 'employee-salary-settle.css'
})
export class EmployeeSalarySettle {
  private http = inject(HttpClient);

  apiUrl = `${environment.apiUrl}/employees`;
  salaryApiUrl = `${environment.apiUrl}/employeeSalarySettlement`;
  salaryLedgerApi = `${environment.apiUrl}/salaryLedger`;

  employeeList: any[] = [];

  isLoadingTableData = false;
  isDeletingData = false;
  isSavingData = false;
  

  // form fields
  editid: number | null = null;
  employeeid: number | null = null;
  date: string = '';
  salary: number = 0;
  paymentType: string = 'ADVANCE';
  payment: number | null = null;
  remark: string = '';
  showModal = false;

  salaryList: any[] = [];

  constructor() {
    this.getEmployees();
    this.getSalaries();
  }

  getEmployees() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.employeeList = res;
    });
  }

  getSalaries() {
    this.isLoadingTableData = true;
    this.http.get<any[]>(this.salaryApiUrl).subscribe(res => {
      this.salaryList = res.map(salary => {
        const employee = this.employeeList.find(d => d._id === salary.employeeid)
        return {
          ...salary,
          employeeName: employee?.fullName,
          employeeSalary: employee?.salary
        }
      })
      this.isLoadingTableData = false;
    });
  }

  getSalaryByEmployeeid() {
    if (!this.employeeid) {
      this.salary = 0;
      return;
    }
  
    const employee = this.employeeList.find(
      emp => emp._id === this.employeeid
    );

  
    if (employee) {

      this.salary = employee.salary ;
    } else {
      this.salary = 0;
    }
  }

  saveSalary() {
    this.isSavingData = true;
    if (this.editid) {
      // update salary
      const updateSalary = {
        _id: this.editid,
        employeeid: this.employeeid,
        date: this.date,
        salary: this.salary,
        paymentType: this.paymentType,
        payment: this.payment,
        remark: this.remark
      };

      this.http.put(`${this.salaryApiUrl}/${this.editid}`, updateSalary).subscribe(() => {
        this.getSalaries();
        this.resetForm();
        this.editid = null;
        this.isSavingData = false;
      });

    } else {
      // add new salary
      const newSalary = {
        employeeid: this.employeeid,
        date: this.date,
        salary: this.salary,
        paymentType: this.paymentType,
        payment: this.payment,
        remark: this.remark
      };

      this.http.post<any>(this.salaryApiUrl, newSalary).subscribe((res) => {
        this.getSalaries();
        this.resetForm();
        this.isSavingData = false;
      });
    }
  }

  onEdit(sal: any) {
    this.editid = sal._id ?? null;
    this.employeeid = sal.employeeid;
    this.date = sal.date;
    this.salary = sal.salary;
    this.paymentType = sal.paymentType;
    this.payment = sal.payment;
    this.remark = sal.remark;
  }

  onDelete(_id: any) {
    this.isDeletingData = true;
    this.http.delete(`${this.salaryApiUrl}/${_id}`).subscribe(() => {
      this.getSalaries();
      this.isDeletingData = false;
    });
  }

  resetForm() {
    this.employeeid = null;
    this.date = '';
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
