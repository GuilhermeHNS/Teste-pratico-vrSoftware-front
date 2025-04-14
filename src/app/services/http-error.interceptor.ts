// http-error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error, messageService, router);
      return throwError(() => error);
    })
  );
};

const handleError = (
  error: HttpErrorResponse,
  messageService: MessageService,
  router: Router
): void => {
  let summary = 'Erro';
  let detail = 'Ocorreu um erro inesperado';

  switch (error.status) {
    case 400:
      summary = 'Erro 400 - Requisição Inválida';
      detail = error.error?.message || 'Dados enviados são inválidos';
      break;
    
    case 401:
      summary = 'Erro 401 - Não Autorizado';
      detail = 'Sua sessão expirou. Faça login novamente.';
      router.navigate(['/login']);
      break;

    case 404:
      summary = 'Erro 404 - Não Encontrado';
      detail = error.error?.message || 'Recurso solicitado não existe';
      break;

    case 500:
      summary = 'Erro 500 - Erro Interno';
      detail = error.error?.message || 'Problema no servidor';
      break;
  }

  messageService.add({
    severity: 'error',
    summary,
    detail,
    life: 5000
  });
};