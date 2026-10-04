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
  salaryLedgerApiUrl = 'http://localhost:3000/salaryLedger';
  employeeAttendanceApiUrl = 'http://localhost:3000/employeeAttendance';

  employeeList: iEmployee[] = [];

  // form fields
  editId: number | null = null;
  employeeId: number | null = null;
  month: string = '';
  salary: number = 0;
  showModal = false;
  salaryGenerated = false;
  currentSalary = 0;

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

  generateSalary() {

    if (!this.employeeId) {
      alert('Please select employee');
      return;
    }
  
    if (!this.month) {
      alert('Please select month');
      return;
    }
  
    const employee = this.employeeList.find(
      emp => emp.id === this.employeeId
    );
  
    if (!employee) {
      alert('Employee not found');
      return;
    }
  
    const employeeSalary = Number(employee.salary || 0);
  
    const selectedMonth = this.month;
  
    // Get attendance of selected employee
    this.http.get<any[]>(
      `${this.employeeAttendanceApiUrl}?employeeId=${this.employeeId}`
    ).subscribe({
      next: (attendanceList) => {
  
        // Only selected month's attendance
        const monthAttendance = attendanceList.filter(attendance =>
          attendance.date.startsWith(selectedMonth)
        );
  
        // Count attendance
        const presentDays = monthAttendance.filter(
          x => x.status === 'Present'
        ).length;
  
        const absentDays = monthAttendance.filter(
          x => x.status === 'Absent'
        ).length;
  
        const halfDays = monthAttendance.filter(
          x => x.status === 'Half Day'
        ).length;
  
        const leaveDays = monthAttendance.filter(
          x => x.status === 'Leave'
        ).length;
  
        // Number of days in selected month
        const [year, month] = selectedMonth.split('-').map(Number);
  
        const totalDays = new Date(
          year,
          month,
          0
        ).getDate();
  
        // Daily salary
        const dailySalary = employeeSalary / totalDays;
  
        // Deduction
        const absentDeduction = absentDays * dailySalary;
  
        // Half day = 50% deduction
        const halfDayDeduction = halfDays * (dailySalary / 2);
  
        const attendanceDeduction =
          absentDeduction + halfDayDeduction;
  
        // Salary after attendance
        const salaryAfterAttendance =
          employeeSalary - attendanceDeduction;
  
        // --------------------------------
        // Get advance for selected month
        // --------------------------------
  
        this.http.get<any[]>(
          `${this.salaryLedgerApiUrl}?employeeId=${this.employeeId}`
        ).subscribe({
          next: (ledgerList) => {
        
            // -----------------------------
            // ADVANCE for selected month
            // -----------------------------
            const monthAdvance = ledgerList.filter(item =>
              item.transactionType === 'ADVANCE' &&
              item.date?.startsWith(selectedMonth)
            );
        
            const totalAdvance = monthAdvance.reduce(
              (total, item) => total + Number(item.debit || 0),
              0
            );
        
        
            // -----------------------------
            // SALARY PAYMENT for selected month
            // -----------------------------
            const monthSalaryPayments = ledgerList.filter(item =>
              item.transactionType === 'SALARY_PAYMENT' &&
              item.date?.startsWith(selectedMonth)
            );
        
            const totalSalaryPaid = monthSalaryPayments.reduce(
              (total, item) => total + Number(item.credit || 0),
              0
            );
        
        
            // -----------------------------
            // Final calculation
            // -----------------------------
            this.salary =
              salaryAfterAttendance
              - totalAdvance
              - totalSalaryPaid;
        
        
            // Prevent negative salary
            if (this.salary < 0) {
              this.salary = 0;
            }
        
        
            console.log('Employee Salary:', employeeSalary);
            console.log('Attendance Deduction:', attendanceDeduction);
            console.log('Advance:', totalAdvance);
            console.log('Already Paid:', totalSalaryPaid);
            console.log('Remaining Salary:', this.salary);
        
            this.salaryGenerated = true;
        
          },
          error: (err) => {
            console.error('Error fetching salary ledger:', err);
          }
        });
  
      },
      error: (err) => {
        console.error('Error fetching attendance:', err);
      }
    });
  }

  saveSalary() {
    if (!this.salaryGenerated || this.salary <= 0) {
      alert('Please generate salary first');
      return;
    }
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
  
      this.http.post<any>(this.salaryApiUrl, newSalary).subscribe({
        next: (res) => {
      
          const ledgerData = {
            employeeId: this.employeeId,
            referenceId: res.id,
            date: new Date().toISOString().split('T')[0],
            transactionType: 'SALARY_PAYMENT',
            debit: 0,
            credit: this.salary,
            description: 'Salary Payment',
            status: 'Active'
          };
      
          this.http.post<any>(
            this.salaryLedgerApiUrl,
            ledgerData
          ).subscribe({
            next: (ledgerRes) => {
      
              console.log('Salary saved:', res);
              console.log('Ledger saved:', ledgerRes);
      
              this.getSalaries();
              this.resetForm();
      
            },
            error: (err) => {
              console.error('Error creating salary ledger:', err);
            }
          });
      
        },
        error: (err) => {
          console.error('Error creating salary:', err);
        }
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
    this.salaryGenerated = false;
    this.editId = null;
  }

  onAdd() {
    this.showModal = true;
    }
    onCancel() {
    this.showModal = false;
    this.resetForm();
    }
}
