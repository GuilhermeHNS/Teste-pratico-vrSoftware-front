import { Injectable } from "@angular/core";

export class ProdutoLoja {
    constructor(
        public descricao: string,
        public precoVenda: number
    ) { }
}