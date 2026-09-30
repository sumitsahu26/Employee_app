import { Component, inject } from '@angular/core';
import { iDepartment, iDesignation } from '../../app.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-designation',
  imports: [CommonModule,FormsModule],
  templateUrl: './designation.html',
  styleUrl: './designation.css'
})
export class Designation {

  apiUrl = 'http://localhost:3000/designations'

  private http = inject(HttpClient);
  
  designationList : iDesignation[] = [];
  departmentList : iDepartment[] = [];
  departmentId? : number;
  designationName : string = '';
  status : string = 'Active';
  editId: number | null = null;
  showModal = false;
  
  constructor() {
    this.getDepartments();
    this.getDesignations();
  }
  
  getDepartments() {
    this.http.get<iDepartment[]>('http://localhost:3000/departments').subscribe((res) => {
      this.departmentList = res;
    });
  }
  getDesignations() {
    this.http.get<iDesignation[]>(this.apiUrl).subscribe((res) => {
      this.designationList = res.map(designation => {
        const dep = this.departmentList.find(d => d.id === designation.departmentId);
        return {
          ...designation,
          departmentName: dep ? dep.depName : ''
        };
      })
    });
  }
  
  saveDesignation(){
    if(this.editId) {
      const updateDept: iDesignation = {
        id: this.editId,
        departmentId: this.departmentId!,
        designationName: this.designationName,
        status: this.status
      };
      this.http.put<iDesignation>(`${this.apiUrl}/${this.editId}` , updateDept).subscribe((res)=> {
        this.getDesignations();
        this.resetForm();
      })
    }else {
      const newDes: iDesignation = {
        departmentId: this.departmentId!,
        designationName: this.designationName,
        status: this.status
      };
    
      this.http.post<iDesignation>(this.apiUrl, newDes).subscribe((res)=> {
        this.getDesignations();
        this.resetForm();
      })
    }
  }
  
  onEdit(item: iDesignation) {
    this.editId = item.id ?? null;
    this.departmentId = item.departmentId;
    this.designationName = item.designationName;
    this.status = item.status;
  }
  
  onDelete(id:any) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe((res)=> {
      this.getDesignations();
    })
  }

  resetForm(){
    this.departmentId = null!;
    this.designationName = '';
    this.status = 'Active';
  }

  onAdd() {
    this.showModal = true;
    }
    onCancel() {
    this.showModal = false;
    this.resetForm();
    }
}
