import { TestBed } from '@angular/core/testing';

import { ProdutoLojaService } from './produto-loja.service';

describe('ProdutoLojaService', () => {
  let service: ProdutoLojaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutoLojaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
