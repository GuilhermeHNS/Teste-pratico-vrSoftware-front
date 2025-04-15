import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Produto } from '../models/produto';
import { ProdutoService } from '../services/produto.service';
import { CustomTableComponent } from '../shared/custom-table/custom-table.component';


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
  selector: 'app-produto',
  imports: [CommonModule, ButtonModule, KeyFilterModule, InputTextModule, ReactiveFormsModule, CustomTableComponent, ConfirmDialogModule],
  providers:[ConfirmationService],
  templateUrl: './produto.component.html',
  styleUrl: './produto.component.css'
})
export class ProdutoComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private destroy$ = new Subject<void>();


  produtoForm!: FormGroup<{
    codigo: FormControl<number | null>;
    descricao: FormControl<string | null>;
    custo: FormControl<number | null>;
    precoVenda: FormControl<number | null>;
  }>;

  produtos!: Produto[];
  cols!: Column[];

  ngOnInit(): void {
    this.inicializaForm();
    this.configurarObservables();
    this.buscaProdutos();

    this.cols = [
      { field: 'id', header: 'Código' },
      { field: 'descricao', header: 'Descrição' },
      { field: 'custo', header: 'Custo' , type: 'currency'},
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
        this.navegaParaCadastro(event.rowData);
        break;
      case 'excluir':
        this.confirmarExclusaoProduto(event.rowData);
        break;
    }
  }

  private confirmarExclusaoProduto(produto: Produto) {
    this.confirmationService.confirm({
      message: 'Deseja confirmar a exclusão desse produto?',
      header: 'Atenção!',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Deletar',
        severity: 'danger',
      },
      accept: () => this.excluirProduto(produto.id)
    })
  }

  navegaParaCadastro(produto?: Produto) {
    this.router.navigate(['/produto/cadastro'], {
      state: { produto: produto } 
    });
  }

  excluirProduto(id: number) {
    this.produtoService.excluiProduto(id).subscribe({
      next: () => {
        this.buscaProdutos();
      }
    })
  }

  get codigo() { return this.produtoForm.controls.codigo; }
  get descricao() { return this.produtoForm.controls.descricao; }
  get custo() { return this.produtoForm.controls.custo; }
  get precoVenda() { return this.produtoForm.controls.precoVenda; }

}
