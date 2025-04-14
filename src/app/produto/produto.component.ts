import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Produto } from '../models/Produto';
import { ProdutoService } from '../services/produto.service';
import { CustomTableComponent } from '../shared/custom-table/custom-table.component';

interface Column {
  field: string;
  header: string;
  type?: 'text' | 'actions'; // 👈 Novo tipo
  actions?: Array<{
    icon?: string;
    label?: string;
    class?: string;
    actionId: string; // Identificador único para cada ação
  }>;
}

@Component({
  selector: 'app-produto',
  imports: [CommonModule, ButtonModule, KeyFilterModule, InputTextModule, ReactiveFormsModule, CustomTableComponent],
  templateUrl: './produto.component.html',
  styleUrl: './produto.component.css'
})
export class ProdutoComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private destroy$ = new Subject<void>();


  produtoForm!: FormGroup<{
    codigo: FormControl<number | null>;
    descricao: FormControl<string | null>;
    custo: FormControl<number | null>;
    precoVenda: FormControl<number | null>;
  }>;

  produtos!: Produto[];
  cols!: any[];

  ngOnInit(): void {
    this.inicializaForm();
    this.configurarObservables();
    this.buscaProdutos();

    this.cols = [
      { field: 'id', header: 'Código' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'custo', header: 'Custo' },
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
      ]),
      precoVenda: new FormControl<number | null>(null, [
        Validators.min(0.01)
      ])
    })
  }

  private configurarObservables() {
    this.produtoForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) =>
          JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(valores => {
        this.buscaProdutos(valores)
      });
  }

  private buscaProdutos(filtros?: any) {
    this.produtoService.buscaProdutos(filtros).subscribe({
      next: (produtos: Produto[]) => {
        this.produtos = produtos;
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  handleButtonClick(event: { 
    event: Event, 
    rowData: any, 
    field: string, 
    actionId: string 
  }) {
    switch(event.actionId) {
      case 'editar':
        this.editarProduto(event.rowData);
        break;
      case 'excluir':
        this.excluirProduto(event.rowData);
        break;
    }
  }

  editarProduto(produto: any) {
    console.log('Editar:', produto);
    // Lógica de edição aqui
  }

  excluirProduto(produto: any) {
    console.log('Excluir:', produto);
    // Lógica de exclusão aqui
  }

  get codigo() { return this.produtoForm.controls.codigo; }
  get descricao() { return this.produtoForm.controls.descricao; }
  get custo() { return this.produtoForm.controls.custo; }
  get precoVenda() { return this.produtoForm.controls.precoVenda; }

}
