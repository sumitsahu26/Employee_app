import { Component, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.development';
// import { any, any } from '../../app.model';

@Component({
  selector: 'app-employee-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-salary.html',
  styleUrls: ['./employee-salary.css']
})
export class EmployeeSalary {
  private http = inject(HttpClient);

  apiUrl = `${environment.apiUrl}/employees`;
  salaryApiUrl = `${environment.apiUrl}/employeeSalary`;
  salaryLedgerApiUrl = `${environment.apiUrl}/salaryLedger`;
  employeeAttendanceApiUrl = `${environment.apiUrl}/employeeAttendance`;

  employeeList: any[] = [];

  // form fields
  editid: number | null = null;
  employeeid: number | null = null;
  month: string = '';
  salary: number = 0;
  showModal = false;
  salaryGenerated = false;
  currentSalary = 0;
  currentMonth: string = new Date().toISOString().slice(0, 7);

  salaryList: any[] = [];

  constructor() {
    this.getEmployees();
    this.getSalaries();
  }

  getEmployees() {
    this.http.get<any[]>(this.apiUrl).subscribe(res => {
      this.employeeList = res;
    });
  }

  getSalaries() {
    this.http.get<any[]>(this.salaryApiUrl).subscribe(res => {
      this.salaryList = res.map(salary => {
        const employee = this.employeeList.find(d=> d._id === salary.employeeid)
        return {
          ...salary,
          employeeName: employee?.fullName,
          employeeSalary: employee?.salary
        }
      })
    });
  }

  generateSalary() {

    if (!this.employeeid) {
      alert('Please select employee');
      return;
    }
  
    if (!this.month) {
      alert('Please select month');
      return;
    }
  
    const employee = this.employeeList.find(
      emp => emp._id === this.employeeid
    );
  
    if (!employee) {
      alert('Employee not found');
      return;
    }
  
    const employeeSalary = Number(employee.salary || 0);
  
    const selectedMonth = this.month;
  
    // Get attendance of selected employee
    this.http.get<any[]>(
      `${this.employeeAttendanceApiUrl}?employeeid=${this.employeeid}`
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
          `${this.salaryLedgerApiUrl}?employeeid=${this.employeeid}`
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

  employeeChange(){
    this.salaryGenerated = false;
  }

  monthChange(){
    this.salaryGenerated = false;
  }

  saveSalary() {
    if (!this.salaryGenerated || this.salary <= 0) {
      alert('Please generate salary first');
      return;
    }
    if (this.editid) {
      // update salary
      const updateSalary = {
        _id: this.editid,
        employeeid: this.employeeid,
        month: this.month,
        salary: this.salary
      };
  
      this.http.put(`${this.salaryApiUrl}/${this.editid}`, updateSalary).subscribe(() => {
        this.getSalaries();
        this.resetForm();
        this.editid = null;
      });
  
    } else {
      // add new salary
      const newSalary = {
        employeeid: this.employeeid,
        month: this.month,
        salary: this.salary 
      };
  
      this.http.post<any>(this.salaryApiUrl, newSalary).subscribe({
        next: (res) => {

          const [year, month] = this.month.split('-').map(Number);

          const lastDay = new Date(year, month, 0)
            .toISOString()
            .split('T')[0];
      
          const ledgerData = {
            employeeid: this.employeeid,
            referenceid: res.id,
            date: lastDay,
            transactionType: 'SALARY_PAYMENT',
            debit: 0,
            credit: this.salary,
            description: 'Salary Payment',
            status: 'Active'
          };
      
          this.http.post(
            this.salaryLedgerApiUrl,
            ledgerData
          ).subscribe({
            next: (ledgerRes) => {
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
  
  onEdit(sal: any) {
    this.editid = sal._id ?? null;
    this.employeeid = sal.employeeid;
    this.month = sal.month;
    this.salary = sal.salary;
  }

  onDelete(_id: any) {
    this.http.delete(`${this.salaryApiUrl}/${_id}`).subscribe(() => {
      this.getSalaries();
    });
  }

  resetForm() {
    this.employeeid = null;
    this.month = '';
    this.salary = 0;
    this.salaryGenerated = false;
    this.editid = null;
  }

  onAdd() {
    this.showModal = true;
    }
    onCancel() {
    this.showModal = false;
    this.resetForm();
    }
}
