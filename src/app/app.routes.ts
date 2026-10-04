import { Routes } from '@angular/router';
import { Department } from './components/department/department';
import { Home } from './components/home/home';
import { Designation } from './components/designation/designation';
import { Employee } from './components/employee/employee';
import { EmployeeSalary } from './components/employee-salary/employee-salary';
import { EmployeeSalarySettle } from './components/employee-salary-settle/employee-salary-settle';
import { EmployeeAttendance } from './components/employee-attendance/employee-attendance';
import { Reports } from './components/reports/reports';
import { EmployeeReport } from './components/reports/employee-report/employee-report';
import { AttendanceReport } from './components/reports/attendance-report/attendance-report';
import { SalaryReport } from './components/reports/salary-report/salary-report';

export const routes: Routes = [
    {
        path : '',
        component : Home
    },
    {
        path : 'department',
        component : Department
    },
    {
        path : 'designation',
        component : Designation
    },
    {
        path : 'employee-onboard',
        component : Employee
    },
    {
        path : 'employee-salary',
        component : EmployeeSalary
    },
    {
        path : 'employee-salary-settle',
        component : EmployeeSalarySettle
    },
    {
        path : 'employee-attendance',
        component : EmployeeAttendance
    },
    {
        path : 'reports',
        component : Reports
    },
    {
        path: 'reports/employee',
        component: EmployeeReport
      },
    {
        path: 'reports/attendance',
        component: AttendanceReport
      },
    {
        path: 'reports/salary',
        component: SalaryReport
      },
];
