import { Component, inject } from '@angular/core';
// import { any, any } from '../../app.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-designation',
  imports: [CommonModule,FormsModule],
  templateUrl: './designation.html',
  styleUrl: './designation.css'
})
export class Designation {

  apiUrl = `${environment.apiUrl}/designations`
  departmentApiUrl = `${environment.apiUrl}/departments`

  private http = inject(HttpClient);
  
  designationList : any[] = [];
  departmentList : any[] = [];
  departmentid? : number;
  designationName : string = '';
  status : string = 'Active';
  editid: number | null = null;
  showModal = false;
  departmentError = '';
  designationNameError = '';

  isLoadingTableData = false;
  isSavingData = false
  isDeletingData = false
  
  constructor() {
    this.getDepartments();
    this.getDesignations();
  }
  
  getDepartments() {
    this.http.get<any[]>(this.departmentApiUrl).subscribe((res) => {
      this.departmentList = res;
    });
  }
  getDesignations() {
    this.isLoadingTableData = true
    this.http.get<any[]>(this.apiUrl).subscribe((res) => {
      this.designationList = res.map(designation => {
        const dep = this.departmentList.find(d => d._id === designation.departmentid);
        return {
          ...designation,
          departmentName: dep ? dep.depName : ''
        };
      }) 
    });
    this.isLoadingTableData = false
  }
  
  saveDesignation(){
    this.departmentError = '';
    this.designationNameError = ''

    if (!this.departmentid) {
      this.departmentError = 'Department is required';
      return;
    }
    if (!this.designationName || !this.designationName.trim()) {
      this.designationNameError = 'Designation Name is required';
      return;
    }

    this.isSavingData = true;

    if(this.editid) {
      const updateDept: any = {
        _id: this.editid,
        departmentid: this.departmentid!,
        designationName: this.designationName,
        status: this.status
      };
      this.http.put<any>(`${this.apiUrl}/${this.editid}` , updateDept).subscribe((res)=> {
        this.getDesignations();
        this.resetForm();
        this.isSavingData = false;
      })
    }else {
      const newDes: any = {
        departmentid: this.departmentid!,
        designationName: this.designationName,
        status: this.status
      };
    
      this.http.post<any>(this.apiUrl, newDes).subscribe((res)=> {
        this.getDesignations();
        this.resetForm();
        this.isSavingData = false;
      })
    }
  }
  
  onEdit(item: any) {
    this.editid = item._id ?? null;
    this.departmentid = item.departmentid;
    this.designationName = item.designationName;
    this.status = item.status;
  }
  
  onDelete(_id:any) {
    this.isDeletingData = true;
    this.http.delete(`${this.apiUrl}/${_id}`).subscribe((res)=> {
      this.getDesignations();
      this.isDeletingData = false;
    })
  }

  resetForm(){
    this.departmentid = null!;
    this.designationName = '';
    this.status = 'Active';
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
