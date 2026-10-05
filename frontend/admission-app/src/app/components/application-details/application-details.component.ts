import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { Application } from '../../models/application';

@Component({
  selector: 'app-application-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './application-details.component.html',
  styleUrl: './application-details.component.css'
})
export class ApplicationDetailsComponent implements OnInit {
  applicationId: string | null = null;
  application: Application | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  // Status update state
  selectedStatus = '';
  isUpdating = false;
  updateSuccessMessage: string | null = null;
  updateErrorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id');
    if (this.applicationId) {
      this.fetchApplicationDetails(this.applicationId);
    } else {
      this.isLoading = false;
      this.errorMessage = 'No application ID provided in route parameters.';
    }
  }

  fetchApplicationDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.applicationService.getApplicationById(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.application = response.data;
          this.selectedStatus = response.data.status;
        } else {
          this.errorMessage = response.message || 'Application not found.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load application details.';
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(): void {
    if (!this.applicationId || !this.selectedStatus) return;

    this.isUpdating = true;
    this.updateSuccessMessage = null;
    this.updateErrorMessage = null;

    this.applicationService.updateApplicationStatus(this.applicationId, this.selectedStatus).subscribe({
      next: (response) => {
        this.isUpdating = false;
        if (response.success && response.data) {
          this.updateSuccessMessage = response.message || 'Status updated successfully!';
          this.application = response.data;
          this.selectedStatus = response.data.status;
        } else {
          this.updateErrorMessage = response.message || 'Failed to update status.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUpdating = false;
        this.updateErrorMessage = err.error?.message || 'Failed to update status.';
        this.cdr.detectChanges();
      }
    });
  }

  getDocumentUrl(): string {
    if (!this.application || !this.application.documentPath) return '#';
    const path = this.application.documentPath;
    return path.startsWith('http') ? path : `http://localhost:5000${path}`;
  }
}
