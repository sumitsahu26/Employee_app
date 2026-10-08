import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-salary-advance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './salary-advance-report.html'
})
export class SalayAdvanceReport {

  private http = inject(HttpClient);

  employeeApiUrl = `${environment.apiUrl}/employees`;
  advanceApiUrl = `${environment.apiUrl}/employeeSalarySettlement`;

  employeeList: any[] = [];

  advanceList: any[] = [];

  filteredAdvanceList: any[] = [];

  searchText = '';

  filterDate = '';

  totalAdvance = 0;

  totalTransactions = 0;

  isLoadingTableData = false;

  constructor() {

    this.getEmployees();

  }

  getEmployees() {

    this.http
      .get<any[]>(this.employeeApiUrl)
      .subscribe({

        next: (res) => {

          this.employeeList = res;

          this.getAdvance();

        },

        error: (err) => {

          console.error(
            'Error fetching employees:',
            err
          );

          this.employeeList = [];

          this.advanceList = [];

          this.filteredAdvanceList = [];

          this.calculateSummary();

        }

      });

  }


  getAdvance() {
    this.isLoadingTableData = true;
    this.http
      .get<any[]>(this.advanceApiUrl)
      .subscribe({

        next: (res) => {

          const advanceTransactions =
            res.filter(
              item =>
                item.paymentType === 'ADVANCE'
            );


          this.advanceList =
            advanceTransactions.map(item => {

              const employee =
                this.employeeList.find(
                  emp =>
                    String(emp._id) ===
                    String(item.employeeid)
                );


              const month =
                item.date
                  ? item.date.substring(0, 7)
                  : '';


              return {

                _id:
                  item._id,

                employeeName:
                  employee?.fullName ||
                  'Unknown Employee',

                date:
                  item.date || '-',

                salary:
                  Number(item.salary || 0),

                payment:
                  Number(item.payment || 0),

                remark:
                  item.remark || '-'

              };

            });


          this.filteredAdvanceList =
            [
              ...this.advanceList
            ];

          this.calculateSummary();
          this.isLoadingTableData = false;

        },

        error: (err) => {

          console.error(
            'Error fetching advance records:',
            err
          );

          this.advanceList = [];

          this.filteredAdvanceList = [];

          this.calculateSummary();
          this.isLoadingTableData = false;

        }

      });

  }

  filterAdvance() {

    let result =
      [
        ...this.advanceList
      ];

    if (this.searchText.trim()) {

      const search =
        this.searchText
          .trim()
          .toLowerCase();


      result =
        result.filter(
          item =>
            item.employeeName
              ?.toLowerCase()
              .includes(search)
        );

    }

    if (this.filterDate) {

      result =
        result.filter(
          item =>
            item.date ===
            this.filterDate
        );

    }

    this.filteredAdvanceList =
      result;

    this.calculateSummary();

  }

  clearFilters() {

    this.searchText = '';

    this.filterDate = '';


    this.filteredAdvanceList =
      [
        ...this.advanceList
      ];


    this.calculateSummary();

  }

  calculateSummary() {

    this.totalTransactions =
      this.filteredAdvanceList.length;


    this.totalAdvance =
      this.filteredAdvanceList.reduce(
        (total, item) => {

          return (
            total +
            Number(item.payment || 0)
          );

        },
        0
      );

  }

  downloadExcel() {

    if (
      this.filteredAdvanceList.length === 0
    ) {

      alert(
        'No advance data available to download'
      );

      return;

    }


    const excelData =
      this.filteredAdvanceList.map(
        (item, index) => {

          return {

            'SN':
              index + 1,

            'Employee Name':
              item.employeeName || '-',

            'Date':
              item.date || '-',

            'Salary':
              Number(item.salary || 0),

            'Advance Amount':
              Number(item.payment || 0),

            'Remark':
              item.remark || '-'

          };

        }
      );


    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Advance Report'
    );


    XLSX.writeFile(
      workbook,
      'Salary_Advance_Report.xlsx'
    );

  }

}