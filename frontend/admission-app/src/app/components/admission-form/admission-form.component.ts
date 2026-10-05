import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';

@Component({
  selector: 'app-admission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admission-form.component.html',
  styleUrl: './admission-form.component.css'
})
export class AdmissionFormComponent implements OnInit {
  admissionForm!: FormGroup;
  selectedFile: File | null = null;
  fileError: string | null = null;
  formSubmitted = false;
  isSubmitting = false;
  successMessage: string | null = null;
  submittedApplicationId: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.admissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      dateOfBirth: ['', [Validators.required, this.pastDateValidator]],
      department: ['', Validators.required],
      marks: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      address: ['', Validators.required]
    });
  }

  // Custom validator for date of birth (must be in the past)
  pastDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? null : { notInPast: true };
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = null;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
        this.fileError = 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.';
        this.selectedFile = null;
        input.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'File size exceeds the 5 MB limit.';
        this.selectedFile = null;
        input.value = '';
        return;
      }

      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.successMessage = null;
    this.submittedApplicationId = null;
    this.errorMessage = null;

    if (!this.selectedFile && !this.fileError) {
      this.fileError = 'Please upload your marksheet document.';
    }

    if (this.admissionForm.valid && this.selectedFile && !this.fileError) {
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('name', this.admissionForm.get('name')?.value);
      formData.append('email', this.admissionForm.get('email')?.value);
      formData.append('phone', this.admissionForm.get('phone')?.value);
      formData.append('dateOfBirth', this.admissionForm.get('dateOfBirth')?.value);
      formData.append('department', this.admissionForm.get('department')?.value);
      formData.append('marks', this.admissionForm.get('marks')?.value);
      formData.append('address', this.admissionForm.get('address')?.value);
      formData.append('document', this.selectedFile);

      this.applicationService.submitApplication(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.successMessage = response.message || 'Application submitted successfully!';
            this.submittedApplicationId = response.applicationId;
            this.admissionForm.reset();
            this.selectedFile = null;
            this.fileError = null;
            this.formSubmitted = false;
          } else {
            this.errorMessage = response.message || 'Submission failed. Please try again.';
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Server error or backend unreachable. Please try again later.';
        }
      });
    }
  }
}
