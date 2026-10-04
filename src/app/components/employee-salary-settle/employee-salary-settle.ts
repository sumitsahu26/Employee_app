import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iEmployee, iSalary, iSalarySettle } from '../../app.model';

@Component({
  selector: 'app-employee-salary-settle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'employee-salary-settle.html',
  styleUrl: 'employee-salary-settle.css'
})
export class EmployeeSalarySettle {
  private http = inject(HttpClient);

  apiUrl = 'http://localhost:3000/employees';
  salaryApiUrl = 'http://localhost:3000/employeeSalarySettlement';
  salaryLedgerApi = 'http://localhost:3000/salaryLedger';

  employeeList: iEmployee[] = [];
  

  // form fields
  editId: number | null = null;
  employeeId: number | null = null;
  date: string = '';
  salary: number = 0;
  paymentType: string = 'ADVANCE';
  payment: number | null = null;
  remark: string = '';
  showModal = false;

  salaryList: iSalarySettle[] = [];

  constructor() {
    this.getEmployees();
    this.getSalaries();
  }

  getEmployees() {
    this.http.get<iEmployee[]>(this.apiUrl).subscribe(res => {
      this.employeeList = res;
    });
  }

  getSalaries() {
    this.http.get<any[]>(this.salaryApiUrl).subscribe(res => {
      this.salaryList = res.map(salary => {
        const employee = this.employeeList.find(d => d.id === salary.employeeId)
        return {
          ...salary,
          employeeName: employee?.fullName,
          employeeSalary: employee?.salary
        }
      })
    });
  }

  getSalaryByEmployeeId() {
    if (!this.employeeId) {
      this.salary = 0;
      return;
    }
  
    const employee = this.employeeList.find(
      emp => emp.id === this.employeeId
    );

  
    if (employee) {

      this.salary = employee.salary ;
    } else {
      this.salary = 0;
    }
  }

  saveSalary() {
    if (this.editId) {
      // update salary
      const updateSalary = {
        id: this.editId,
        employeeId: this.employeeId,
        date: this.date,
        salary: this.salary,
        paymentType: this.paymentType,
        payment: this.payment,
        remark: this.remark
      };

      this.http.put(`${this.salaryApiUrl}/${this.editId}`, updateSalary).subscribe(() => {
        this.getSalaries();
        this.resetForm();
        this.editId = null;
      });

    } else {
      // add new salary
      const newSalary = {
        employeeId: this.employeeId,
        date: this.date,
        salary: this.salary,
        paymentType: this.paymentType,
        payment: this.payment,
        remark: this.remark
      };

      this.http.post<any>(this.salaryApiUrl, newSalary).subscribe((res) => {

        const settlementId = res.id;

        this.http.post(this.salaryLedgerApi, {
          employeeId: this.employeeId,
          referenceId: settlementId,
          date: this.date,
          transactionType: this.paymentType,
          debit: this.payment,
          credit: 0,
          description: "Salary Advance",
          status: "Active"

        }).subscribe(() => {
          this.getSalaries();
          this.resetForm();
          this.editId = null;
        });

        this.getSalaries();
        this.resetForm();
      });
    }
  }

  onEdit(sal: iSalarySettle) {
    this.editId = sal.id ?? null;
    this.employeeId = sal.employeeId;
    this.date = sal.date;
    this.salary = sal.salary;
    this.paymentType = sal.paymentType;
    this.payment = sal.payment;
    this.remark = sal.remark;
  }

  onDelete(id: any) {
    this.http.delete(`${this.salaryApiUrl}/${id}`).subscribe(() => {
      this.getSalaries();
    });
  }

  resetForm() {
    this.employeeId = null;
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
