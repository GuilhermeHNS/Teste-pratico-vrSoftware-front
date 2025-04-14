import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { CustomTableComponent } from '../shared/custom-table/custom-table.component';
import { Produto } from '../models/Produto';
import { ProdutoLoja } from '../models/Produto-Loja';
import { ProdutoLojaService } from '../services/produto-loja.service';
import { NavigationEnd, Router } from '@angular/router';

interface Column {
  field: string;
  header: string;
  type?: 'text' | 'actions' | 'currency';
  actions?: Array<{
    icon?: string;
    label?: string;
    class?: string;
    actionId: string;
  }>;
}

@Component({
  selector: 'app-cadastro-produto',
  imports: [CommonModule, ButtonModule, ReactiveFormsModule, InputTextModule, CustomTableComponent],
  templateUrl: './cadastro-produto.component.html',
  styleUrl: './cadastro-produto.component.css'
})
export class CadastroProdutoComponent implements OnInit, OnDestroy {

  constructor(private router: Router){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.produto = history.state?.produto;
      }
    })
  }

  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  private produtoLojaService = inject(ProdutoLojaService)

  produtoForm!: FormGroup<{
    codigo: FormControl<number | null>;
    descricao: FormControl<string | null>;
    custo: FormControl<number | null>;
  }>;

  produto!: Produto;
  produtoLojaList!: ProdutoLoja[]
  cols: Column[] = [];

  ngOnInit(): void {
    this.inicializaForm();
    this.cols = [
      { field: 'descricao', header: 'Descrição' },
      { field: 'precoVenda', header: 'Preço de venda(R$)', type: 'currency' },
      {
        field: '',
        header: '',
        type: 'actions',
        actions: [
          {
            actionId: 'excluir',
            icon: 'pi pi-trash',
            class: 'p-button-danger p-button-sm',
            label: ''
          },
          {
            actionId: 'editar',
            icon: 'pi pi-pencil',
            class: 'p-button-warning p-button-sm',
            label: ''
          }
        ]
      }
    ]

    if(this.produto) {
      this.codigo.setValue(this.produto.id);
      this.descricao.setValue(this.produto.descricao);
      this.custo.setValue(this.produto.custo)
      this.carregaProdutoLojaPorProduto(this.produto.id)
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializaForm() {
    this.produtoForm = this.fb.group({
      codigo: new FormControl<number | null>(null, [
        Validators.min(1)
      ]),
      descricao: new FormControl<string | null>(null, [
        Validators.maxLength(60)
      ]),
      custo: new FormControl<number | null>(null, [
        Validators.min(0.01)
      ])
    })
  }

  private carregaProdutoLojaPorProduto(id: number) {
    this.produtoLojaService.buscaProdutoLojaPorIdProduto(id).subscribe({
      next: (produtoLoja: ProdutoLoja[]) => {
        this.produtoLojaList = produtoLoja;
      }
    })
  }

  handleButtonClick(event: {
    event: Event,
    rowData: any,
    field: string,
    actionId: string
  }) {
    switch (event.actionId) {
      case 'editar':
        // this.editarProduto(event.rowData);
        break;
      case 'excluir':
        // this.confirmarExclusaoProduto(event.rowData);
        break;
    }
  }

  openCadastroDialog(event: { event: Event }) {

  }

  get codigo() { return this.produtoForm.controls.codigo; }
  get descricao() { return this.produtoForm.controls.descricao; }
  get custo() { return this.produtoForm.controls.custo; }

}
