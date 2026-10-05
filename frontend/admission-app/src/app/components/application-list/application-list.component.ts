import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { Application } from '../../models/application';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.css'
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Search and Filter State
  searchTerm = '';
  selectedDepartment = 'ALL';
  selectedStatus = 'ALL';

  constructor(
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.applicationService.getApplications().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success && Array.isArray(response.data)) {
          this.applications = response.data;
        } else {
          this.errorMessage = response?.message || 'Failed to load applications.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Server error or database unavailable. Please check backend status.';
        this.cdr.detectChanges();
      }
    });
  }

  // Combined Client-Side Filtering Getter
  get filteredApplications(): Application[] {
    return this.applications.filter((app) => {
      // 1. Search term filter (Name or Email)
      const term = this.searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        app.name.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term);

      // 2. Department filter
      const matchesDepartment =
        this.selectedDepartment === 'ALL' || app.department === this.selectedDepartment;

      // 3. Status filter
      const matchesStatus =
        this.selectedStatus === 'ALL' || app.status === this.selectedStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }

  // Reset all search and filter fields
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = 'ALL';
    this.selectedStatus = 'ALL';
  }
}
