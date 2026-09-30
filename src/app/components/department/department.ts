import { CommonModule } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms'
import { iDepartment } from '../../app.model';

@Component({
  selector: 'app-department',
  imports: [CommonModule,FormsModule],
  templateUrl: './department.html',
  styleUrl: './department.css'
})
export class Department {

apiUrl = 'http://localhost:3000/departments'

private http = inject(HttpClient);

departmentList : iDepartment[] = []; 
depName : string = '';  
status : string = 'Active';
editId: number | null = null;
showModal = false;
errorMessage = '';

constructor() {
  this.getDepartments();
}  

getDepartments() {
  this.http.get<iDepartment[]>(this.apiUrl).subscribe((res) => {
    this.departmentList = res;
  });
}

saveDepartment(){

  this.errorMessage = '';

  if (!this.depName || !this.depName.trim()) {
    this.errorMessage = 'Department Name is required';
    return;
  }

  if(this.editId) {
    const updateDept: iDepartment = {
      id: this.editId,
      depName: this.depName,
      status: this.status
    };
    this.http.put<iDepartment>(`${this.apiUrl}/${this.editId}` , updateDept).subscribe((res)=> {
      this.getDepartments()
      this.resetForm()
    })
  }else {
    const newDept: iDepartment = {
      depName: this.depName,
      status: this.status
    };
  
    this.http.post<iDepartment>(this.apiUrl, newDept).subscribe((res)=> {
      this.getDepartments()
      this.resetForm()
    })
  }
}

onEdit(item: iDepartment) {
  this.showModal = true;
  this.editId = item.id ?? null;
  this.depName = item.depName;
  this.status = item.status;
}

onDelete(id:any) {
  this.http.delete(`${this.apiUrl}/${id}`).subscribe((res)=> {
    this.getDepartments()
  })
}

resetForm(){
  this.editId = null;
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
