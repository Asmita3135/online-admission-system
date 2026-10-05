export interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string | Date;
  department: 'CSE' | 'ECE' | 'IT' | string;
  marks: number;
  address: string;
  documentName: string;
  documentPath: string;
  status: 'Submitted' | 'Review' | 'Selected' | 'Rejected' | string;
  createdAt: string | Date;
}

export interface ApplicationResponse {
  success: boolean;
  data?: Application[];
  message?: string;
}
