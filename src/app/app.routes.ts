import { Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { Menu } from './components/dashboard/menu/menu';

import { Home } from './components/home/home';
import { Department } from './components/department/department';
import { Designation } from './components/designation/designation';
import { Employee } from './components/employee/employee';
import { EmployeeSalary } from './components/employee-salary/employee-salary';
import { EmployeeSalarySettle } from './components/employee-salary-settle/employee-salary-settle';
import { EmployeeAttendance } from './components/employee-attendance/employee-attendance';

import { Reports } from './components/reports/reports';
import { EmployeeReport } from './components/reports/employee-report/employee-report';
import { AttendanceReport } from './components/reports/attendance-report/attendance-report';
import { SalaryReport } from './components/reports/salary-report/salary-report';
import { SalayAdvanceReport } from './components/reports/salary-advance-report/salary-advance-report';

import { AdminLogin } from './components/admin-login/admin-login';
import { PublicLayouts } from './components/layouts/public-layouts/public-layouts';
import { AdminLayouts } from './components/layouts/admin-layouts/admin-layouts';

import { adminAuthGuard } from './guards/admin-auth-guard';

import { MenuItems } from './components/menu/menu';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayouts,
    children: [

      {
        path: '',
        component: Dashboard
      },

      {
        path: 'menu',
        component: Menu
      }

    ]
  },
  {
    path: 'admin',
    component: AdminLogin
  },
  {
    path: 'admin',
    component: AdminLayouts,
    canActivate: [adminAuthGuard],
    children: [

      {
        path: 'dashboard',
        component: Home,
      },

      {
        path: 'department',
        component: Department
      },

      {
        path: 'designation',
        component: Designation
      },

      {
        path: 'employee-onboard',
        component: Employee
      },

      {
        path: 'employee-salary',
        component: EmployeeSalary
      },

      {
        path: 'employee-salary-settle',
        component: EmployeeSalarySettle
      },

      {
        path: 'employee-attendance',
        component: EmployeeAttendance
      },

      {
        path: 'reports',
        component: Reports
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

      {
        path: 'reports/advance',
        component: SalayAdvanceReport
      },

      {
        path: 'menu',
        component: MenuItems
      }

    ]
  }

];