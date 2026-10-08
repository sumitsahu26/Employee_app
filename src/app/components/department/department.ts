import { CommonModule } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms'
import { environment } from '../../../environments/environment.development';
// import { idepartment } from '../../app.model';

@Component({
  selector: 'app-department',
  imports: [CommonModule,FormsModule],
  templateUrl: './department.html',
  styleUrl: './department.css'
})
export class Department {

apiUrl = `${environment.apiUrl}/departments`

private http = inject(HttpClient);

departmentList : any[] = []; 
depName : string = '';  
status : string = 'Active';
editid: number | null = null;
showModal = false;
errorMessage = '';

isLoadingDepartments = false;
isSavingDepartment = false;
isDeletingDepartment = false;

constructor() {
  this.getDepartments();
}  

getDepartments() {

  this.isLoadingDepartments = true;

  this.http.get<any>(this.apiUrl).subscribe({

    next: (res) => {
      this.departmentList = res;
      this.isLoadingDepartments = false;
    },

    error: (err) => {
      console.error(err);
      this.isLoadingDepartments = false;
    }

  });
}

saveDepartment(){

  this.errorMessage = '';

  if (!this.depName || !this.depName.trim()) {
    this.errorMessage = 'Department Name is required';
    return;
  }

  this.isSavingDepartment = true;

  if(this.editid) {
    const updateDept: any = {
      _id: this.editid,
      depName: this.depName,
      status: this.status
    };
    this.http.put<any>(`${this.apiUrl}/${this.editid}` , updateDept).subscribe((res)=> {
      this.getDepartments()
      this.resetForm()
      this.isSavingDepartment = false;
    })
  }else {
    const newDept: any = {
      depName: this.depName,
      status: this.status
    };
  
    this.http.post<any>(this.apiUrl, newDept).subscribe((res)=> {
      this.getDepartments()
      this.resetForm()
      this.isSavingDepartment = false;
    })
  }
}

onEdit(item: any) {
  this.showModal = true;
  this.editid = item._id ?? null;
  this.depName = item.depName;
  this.status = item.status;
}

onDelete(_id: any) {

  if (!confirm('Are you sure you want to delete this department?')) {
    return;
  }

  this.isDeletingDepartment = true;

  this.http
    .delete(`${this.apiUrl}/${_id}`)
    .subscribe({

      next: (res) => {

        this.getDepartments();

        this.isDeletingDepartment = false;

      },

      error: (err) => {

        console.error('Delete department error:', err);

        this.isDeletingDepartment = false;

      }

    });
}

resetForm(){
  this.editid = null;
  this.depName = '';
  this.status = 'Active';
}

onAdd() {
this.showModal = true;
}
onCancel() {
this.showModal = false;
this.errorMessage = ""
this.resetForm();
}


}
