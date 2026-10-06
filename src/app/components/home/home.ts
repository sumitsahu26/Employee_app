import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../environments/environment.development';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private http = inject(HttpClient);
  employeeList: any[] = [];
  designationList: any[] = [];
  departmentList: any[] = [];

  private deptChart: Chart | null = null;
  private salaryChart: Chart | null = null;

  // 🔹 store salary data separately
  salaryData: any[] = [];
  totalSalaryPaid: number = 0;

  employeeApiUrl = `${environment.apiUrl}/employees`;
  departmentApiUrl = `${environment.apiUrl}/departments`;
  salaryApiUrl = `${environment.apiUrl}/employeeSalary`;
  designationApiUrl = `${environment.apiUrl}/designations`;
  employeeAttendanceApiUrl = `${environment.apiUrl}/employeeAttendance`;

  constructor() {
    this.getDepartments();
    this.getDesignations();
    this.getEmployeeSalary();

  }

  getDepartments() {
    this.http.get<any[]>(this.departmentApiUrl).subscribe(res => {
      this.departmentList = res;
      this.getEmployees();
    });
  }

  getEmployees() {
    this.http.get<any[]>(this.employeeApiUrl).subscribe(res => {
      this.employeeList = res.map(emp => {
        const dept = this.departmentList.find(d => d._id === emp.departmentid);
        const des = this.designationList.find(ds => ds._id === emp.designationid);
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
    this.http.get<any[]>(this.designationApiUrl).subscribe(res => {
      this.designationList = res;
      this.getEmployees();
    });
  }

  // 🔹 fetch salary once, store it and calculate totals
  getEmployeeSalary() {
    this.http.get<any[]>(this.salaryApiUrl).subscribe(res => {
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
