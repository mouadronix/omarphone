import { Component, input } from '@angular/core';

@Component({
  selector: 'op-icon',
  imports: [],
  templateUrl: './ui-icon.component.html',
  styleUrl: './ui-icon.component.css',
})
export class UiIconComponent {
  readonly name = input.required<string>();
}
