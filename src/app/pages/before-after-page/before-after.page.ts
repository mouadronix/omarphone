import { Component } from '@angular/core';
import { BeforeAfterComponent } from '../../components/before-after-component/before-after.component';
import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';

@Component({
  selector: 'app-before-after-page',
  imports: [BeforeAfterComponent, UiIconComponent],
  templateUrl: './before-after.page.html',
  styleUrl: './before-after.page.css',
})
export class BeforeAfterPage {}
