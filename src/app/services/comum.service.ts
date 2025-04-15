import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ComumService {
  constructor(private messageService: MessageService) { }

  openMessageError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 5000
    });
  }

  openSuccessMessage(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 5000
    });
  }
}
