import { Component, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { iEmployee, iSalary } from '../../app.model';

@Component({
  selector: 'app-employee-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-salary.html',
  styleUrls: ['./employee-salary.css']
})
export class EmployeeSalary {
  private http = inject(HttpClient);

  apiUrl = 'http://localhost:3000/employees';
  salaryApiUrl = 'http://localhost:3000/employeeSalary';

  employeeList: iEmployee[] = [];

  // form fields
  editId: number | null = null;
  employeeId: number | null = null;
  month: string = '';
  salary: number = 0;
  showModal = false;

  salaryList: iSalary[] = [];

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
        const employee = this.employeeList.find(d=> d.id === salary.employeeId)
        return {
          ...salary,
          employeeName: employee?.fullName,
          employeeSalary: employee?.salary
        }
      })
    });
  }

  saveSalary() {
    if (this.editId) {
      // update salary
      const updateSalary = {
        id: this.editId,
        employeeId: this.employeeId,
        month: this.month,
        salary: this.salary
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
        month: this.month,
        salary: this.salary 
      };
  
      this.http.post(this.salaryApiUrl, newSalary).subscribe(() => {
        this.getSalaries();
        this.resetForm();
      });
    }
  }
  
  onEdit(sal: iSalary) {
    this.editId = sal.id ?? null;
    this.employeeId = sal.employeeId;
    this.month = sal.month;
    this.salary = sal.salary;
  }

  onDelete(id: any) {
    this.http.delete(`${this.salaryApiUrl}/${id}`).subscribe(() => {
      this.getSalaries();
    });
  }

  resetForm() {
    this.employeeId = null;
    this.month = '';
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
