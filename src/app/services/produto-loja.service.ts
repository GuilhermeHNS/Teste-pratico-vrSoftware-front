import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateProdutoLojaDto } from '../cadastro-produto/cadastro-produto.component';
import { PaginationModel } from '../models/pagination.model';
import { ProdutoLoja } from '../models/produto-Loja';

@Injectable({
  providedIn: 'root'
})
export class ProdutoLojaService {
  private apiUrl = `${environment.apiUrl}/produto-loja`

  constructor(private http: HttpClient) { }

  buscaProdutoLojaPorIdProduto(id: number, page: number, limit: number): Observable<PaginationModel> {
    let params = new HttpParams();
    params = params.append("page", page.toString());
    params = params.append("limit", limit.toString());
    return this.http.get<PaginationModel>(`${this.apiUrl}/produto/${id}`, { params: params });
  }

  apagaProdutoLoja(id: number): Observable<ProdutoLoja> {
    return this.http.delete<ProdutoLoja>(`${this.apiUrl}/${id}`);
  }

  cadastraProdutoLoja(req: CreateProdutoLojaDto): Observable<ProdutoLoja> {
    return this.http.post<ProdutoLoja>(`${this.apiUrl}`, req)
  }

  atualizaProdutoLoja(req: CreateProdutoLojaDto, id: number): Observable<ProdutoLoja> {
    return this.http.patch<ProdutoLoja>(`${this.apiUrl}/${id}`, req);
  }

}
