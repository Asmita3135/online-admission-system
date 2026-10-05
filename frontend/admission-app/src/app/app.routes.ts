import { Routes } from '@angular/router';
import { AdmissionFormComponent } from './components/admission-form/admission-form.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationDetailsComponent } from './components/application-details/application-details.component';

export const routes: Routes = [
  { path: '', component: AdmissionFormComponent },
  { path: 'admin', component: ApplicationListComponent },
  { path: 'admin/:id', component: ApplicationDetailsComponent },
  { path: '**', redirectTo: '' }
];
