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

constructor() {
  this.getDepartments();
}  

getDepartments() {
  this.http.get<any>(this.apiUrl).subscribe((res) => {
    this.departmentList = res;
  });
}

saveDepartment(){

  this.errorMessage = '';

  if (!this.depName || !this.depName.trim()) {
    this.errorMessage = 'Department Name is required';
    return;
  }

  if(this.editid) {
    const updateDept: any = {
      _id: this.editid,
      depName: this.depName,
      status: this.status
    };
    this.http.put<any>(`${this.apiUrl}/${this.editid}` , updateDept).subscribe((res)=> {
      this.getDepartments()
      this.resetForm()
    })
  }else {
    const newDept: any = {
      depName: this.depName,
      status: this.status
    };
  
    this.http.post<any>(this.apiUrl, newDept).subscribe((res)=> {
      this.getDepartments()
      this.resetForm()
    })
  }
}

onEdit(item: any) {
  this.showModal = true;
  this.editid = item._id ?? null;
  this.depName = item.depName;
  this.status = item.status;
}

onDelete(_id:any) {
  this.http.delete(`${this.apiUrl}/${_id}`).subscribe((res)=> {
    this.getDepartments()
  })
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
