
export interface iDepartment {
    id? : number;
    depName : string;
    status : string;
}

export interface iDesignation {
    id? : number;
    departmentId : number;
    departmentName?: string;
    designationName : string
    status : string;
}

export interface iEmployee {
    id?: number;
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfJoining: string;
    departmentId: number;
    designationId: number;
    employeeType: string;
    salary: number;
    departmentName?: string;
    designationName?: string;
  }

  export interface iSalary {
    id?: number;
    employeeId: number;
    month: string;
    salary: number;
    employeeName: string;
    employeeSalary: string;
  }
  