import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';
import { PaginationModel } from '../models/pagination.model';

interface FiltrosProduto {
  codigo?: number,
  descricao?: string,
  custo?: number,
  precoVenda?: number
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = `${environment.apiUrl}/produto`

  constructor(private http: HttpClient) { }

  buscaProdutos(page: number, limit: number, filtros?: FiltrosProduto): Observable<PaginationModel> {
    let params = new HttpParams();
    params = params.append("page", page.toString());
    params = params.append("limit", limit.toString());  
    if (filtros) {
      (Object.keys(filtros) as Array<keyof FiltrosProduto>).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.append(
            key as string,
            typeof value === 'number' ? value.toString() : value
          );
        }
      });
    }
    return this.http.get<PaginationModel>(this.apiUrl, { params });
  }

  cadastraProduto(createProdutoDto: any): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, createProdutoDto);
  }

  atualizaProduto(createProdutoDto: any, id: number): Observable<Produto> {
    return this.http.patch<Produto>(`${this.apiUrl}/${id}`, createProdutoDto);
  }

  excluiProduto(id: number): Observable<Produto> {
    return this.http.delete<Produto>(`${this.apiUrl}/${id}`);
  }

}
