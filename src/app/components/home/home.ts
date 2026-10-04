import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { iDepartment, iDesignation, iEmployee } from '../../app.model';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private http = inject(HttpClient);
  employeeList: iEmployee[] = [];
  designationList: iDesignation[] = [];
  departmentList: iDepartment[] = [];

  private deptChart: Chart | null = null;
  private salaryChart: Chart | null = null;

  // 🔹 store salary data separately
  salaryData: any[] = [];
  totalSalaryPaid: number = 0;

  constructor() {
    this.getDepartments();
    this.getDesignations();
    this.getEmployeeSalary(); // salary fetch independent
  }

  getDepartments() {
    this.http.get<iDepartment[]>('http://localhost:3000/departments').subscribe(res => {
      this.departmentList = res;
      this.getEmployees();
    });
  }

  getEmployees() {
    this.http.get<iEmployee[]>('http://localhost:3000/employees').subscribe(res => {
      this.employeeList = res.map(emp => {
        const dept = this.departmentList.find(d => d.id === emp.departmentId);
        const des = this.designationList.find(ds => ds.id === emp.designationId);
        return {
          ...emp,
          departmentName: dept?.depName,
          designationName: des?.designationName
        };
      });

      this.loadDeptChart();
    });
  }

  getDesignations() {
    this.http.get<iDesignation[]>('http://localhost:3000/designations').subscribe(res => {
      this.designationList = res;
      this.getEmployees();
    });
  }

  // 🔹 fetch salary once, store it and calculate totals
  getEmployeeSalary() {
    this.http.get<any[]>('http://localhost:3000/employeeSalary').subscribe(res => {
      this.salaryData = res;

      // calculate total salary paid
      this.totalSalaryPaid = res.reduce((sum, s) => sum + Number(s.salary), 0);

      // build chart from this.salaryData
      this.loadSalaryChart();
    });
  }

  loadDeptChart() {
    const labels = this.departmentList.map(d => d.depName);
    const data = labels.map(depName =>
      this.employeeList.filter(emp => emp.departmentName === depName).length
    );

    if (this.deptChart) this.deptChart.destroy();

    this.deptChart = new Chart("deptChart", {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']
        }]
      }
    });
  }

  loadSalaryChart() {
    const months = Array.from(new Set(this.salaryData.map(s => s.month)));
    const data = months.map(month =>
      this.salaryData
        .filter(s => s.month === month)
        .reduce((sum, s) => sum + Number(s.salary), 0)
    );

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316'];

    if (this.salaryChart) this.salaryChart.destroy();

    this.salaryChart = new Chart("growthChart", {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Total Salary Paid (₹)',
          data: data,
          backgroundColor: months.map((_, i) => colors[i % colors.length])
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          x: { title: { display: true, text: 'Months' } },
          y: { beginAtZero: true, title: { display: true, text: 'Salary (₹)' } }
        }
      }
    });
  }
}
