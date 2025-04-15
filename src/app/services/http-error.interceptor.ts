// http-error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ComumService } from './comum.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const comumService = inject(ComumService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error, comumService, router);
      return throwError(() => error);
    })
  );
};

const handleError = (
  error: HttpErrorResponse,
  comumService: ComumService,
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
  comumService.openMessageError(summary, detail)
};