import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports {

  reports = [
    {
      title: 'Employee Report',
      description: 'View employee details, department, designation and salary.',
      icon: '👤',
      route: '/reports/employee',
      bg: 'bg-blue-100',
      iconBg: 'bg-blue-600'
    },
    {
      title: 'Attendance Report',
      description: 'View employee attendance and daily attendance records.',
      icon: '📅',
      route: '/reports/attendance',
      bg: 'bg-green-100',
      iconBg: 'bg-green-600'
    },
    {
      title: 'Salary Report',
      description: 'View employee salary, payment and salary history.',
      icon: '💰',
      route: '/reports/salary',
      bg: 'bg-purple-100',
      iconBg: 'bg-purple-600'
    },
    // {
    //   title: 'Advance Report',
    //   description: 'View employee salary advance and settlement records.',
    //   icon: '💵',
    //   route: '/reports/advance',
    //   bg: 'bg-orange-100',
    //   iconBg: 'bg-orange-600'
    // },
    // {
    //   title: 'Department Report',
    //   description: 'View department-wise employee information.',
    //   icon: '🏢',
    //   route: '/reports/department',
    //   bg: 'bg-pink-100',
    //   iconBg: 'bg-pink-600'
    // },
    // {
    //   title: 'Designation Report',
    //   description: 'View designation-wise employee information.',
    //   icon: '💼',
    //   route: '/reports/designation',
    //   bg: 'bg-cyan-100',
    //   iconBg: 'bg-cyan-600'
    // }
  ];
}