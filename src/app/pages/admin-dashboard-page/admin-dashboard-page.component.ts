import { Component, Input } from '@angular/core';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [UiIconComponent],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css',
})
export class AdminDashboardPageComponent {
  @Input({ required: true }) admin!: any;
}
