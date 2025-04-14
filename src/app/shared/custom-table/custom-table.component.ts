import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

interface Column {
  field: string;
  header: string;
  isButton?: boolean;
  buttonIcon?: string;
  buttonLabel?: string;
  buttonClass?: string;
}

@Component({
  selector: 'app-custom-table',
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.css'
})
export class CustomTableComponent {
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() tableStyle: any = { 'width': '100%' };
  @Input() showHeaderButton: boolean = false;
  @Input() iconHeaderButton: string = '';
  @Output() buttonClick = new EventEmitter<{ event: Event, rowData: any, field: string, actionId: string}>();
  @Output() buttonHeaderClick = new EventEmitter<{event: Event}>();

  onButtonClick(event: Event, rowData: any, field: string, actionId: string) {
    this.buttonClick.emit({
      event,
      rowData,
      field,
      actionId
    });
  }

  onButtonHeaderClick(event: Event) {
    this.buttonHeaderClick.emit({
      event
    });
  }
}
