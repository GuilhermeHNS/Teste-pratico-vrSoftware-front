import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProdutoLoja } from '../models/produto-Loja';

@Injectable({
  providedIn: 'root'
})
export class ProdutoLojaService {
  private apiUrl = `${environment.apiUrl}/produto-loja`

  constructor(private http: HttpClient) { }

  buscaProdutoLojaPorIdProduto(id: number): Observable<ProdutoLoja[]> {
    return this.http.get<ProdutoLoja[]>(`${this.apiUrl}/produto/${id}`);
  }

  apagaProdutoLoja(id: number): Observable<ProdutoLoja> {
    return this.http.delete<ProdutoLoja>(`${this.apiUrl}/${id}`);
  }

}
