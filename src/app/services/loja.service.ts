import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/Produto';
import { Loja } from '../models/loja';

@Injectable({
  providedIn: 'root'
})
export class LojaService {
  private apiUrl = `${environment.apiUrl}/loja`

  constructor(private http: HttpClient) { }

  buscaLojas(): Observable<Loja[]> {
    return this.http.get<Loja[]>(this.apiUrl);
  }

}
