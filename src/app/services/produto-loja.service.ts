import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

  cadastraProdutoLojaList(req: any): Observable<ProdutoLoja[]> {
    return this.http.post<ProdutoLoja[]>(`${this.apiUrl}/bulk`, req)
  }

  apagaProdutoLojaList(req: any): Observable<ProdutoLoja> {
    return this.http.delete<ProdutoLoja>(`${this.apiUrl}/bulk`, { body: req })
  }

}
