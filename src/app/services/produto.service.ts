import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/Produto';

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

  buscaProdutos(filtros?: FiltrosProduto): Observable<Produto[]> {
    let params = new HttpParams();
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
    return this.http.get<Produto[]>(this.apiUrl, { params });
  }
}
