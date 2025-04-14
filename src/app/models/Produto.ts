import { Injectable } from "@angular/core";

export class Produto {
    constructor(
        public id: number,
        public codigo: number,
        public descricao: string,
        public custo: number
    ) { }
}