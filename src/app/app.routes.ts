import { Routes } from '@angular/router';
import { Department } from './components/department/department';
import { Home } from './components/home/home';
import { Designation } from './components/designation/designation';
import { Employee } from './components/employee/employee';
import { EmployeeSalary } from './components/employee-salary/employee-salary';

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
    }
];
