import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { SelectModule } from 'primeng/select';
import { Subject } from 'rxjs';
import { Loja } from '../models/loja';
import { Produto } from '../models/produto';
import { ProdutoLoja } from '../models/produto-Loja';
import { ComumService } from '../services/comum.service';
import { LojaService } from '../services/loja.service';
import { ProdutoLojaService } from '../services/produto-loja.service';
import { ProdutoService } from '../services/produto.service';
import { CustomTableComponent } from '../shared/custom-table/custom-table.component';
import { TableLazyLoadEvent } from 'primeng/table';
import { PaginationModel } from '../models/pagination.model';


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

interface CreateProdutoDto {
  descricao: string;
  custo?: number;
}

export interface CreateProdutoLojaDto {
  idProduto: number,
  idLoja: number,
  precoVenda: number
}



@Component({
  selector: 'app-cadastro-produto',
  imports: [CommonModule, ButtonModule, ReactiveFormsModule, InputTextModule, CustomTableComponent, KeyFilterModule, ConfirmDialogModule, DialogModule, SelectModule],
  providers: [ConfirmationService],
  templateUrl: './cadastro-produto.component.html',
  styleUrl: './cadastro-produto.component.css'
})
export class CadastroProdutoComponent implements OnInit, OnDestroy {

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.produto = history.state?.produto;
      }
    })
  }

  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();
  private produtoLojaService = inject(ProdutoLojaService);
  private produtoService = inject(ProdutoService);
  private lojaService = inject(LojaService);
  private comumService = inject(ComumService)

  produtoForm!: FormGroup<{
    codigo: FormControl<number | null>;
    descricao: FormControl<string | null>;
    custo: FormControl<number | null>;
  }>;

  lojaPrecoVendaForm!: FormGroup<{
    loja: FormControl<Loja | null>;
    precoVenda: FormControl<number | null>;
  }>;

  produto!: Produto;
  produtoLojaList!: ProdutoLoja[]
  produtoLojaEdicao!: ProdutoLoja;

  lojaList!: Loja[];
  cols: Column[] = [];
  dialogPreco: boolean = false;

  pageProdutos: number = 1;
  limitDadosProdutos: number = 10;
  totalRecords: number = 0;

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

    if (this.produto) {
      this.inicializaValoresProduto();
    }

  }

  inicializaValoresProduto() {
    this.codigo.setValue(this.produto.id);
    this.descricao.setValue(this.produto.descricao);
    this.custo.setValue(this.produto.custo)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializaForm() {
    this.produtoForm = this.fb.group({
      codigo: new FormControl<number | null>(null),
      descricao: new FormControl<string | null>(null, [
        Validators.required,
        Validators.maxLength(60)
      ]),
      custo: new FormControl<number | null>(null, [
        Validators.min(0.01)
      ])
    })
    this.codigo.disable();

    this.lojaPrecoVendaForm = this.fb.group({
      loja: new FormControl<Loja | null>(null, [
        Validators.required
      ]),
      precoVenda: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(0.01)
      ])
    })
  }

  private carregaProdutoLojaPorProduto(id: number) {
    this.produtoLojaService.buscaProdutoLojaPorIdProduto(id, this.pageProdutos, this.limitDadosProdutos).subscribe({
      next: (result: PaginationModel) => {
        this.produtoLojaList = result.data;
        this.totalRecords = result.total;
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
        this.openCadastroDialog(event.rowData);
        break;
      case 'excluir':
        this.confirmarExclusaoProdutoLoja(event.rowData)
        break;
    }
  }

  verificaEdicaoProdutoLoja() {
    if (this.produtoLojaEdicao) {
      let loja = this.lojaList.find((l) => l.id == this.produtoLojaEdicao.idLoja);
      this.loja.setValue(loja || null)
      this.precoVenda.setValue(this.produtoLojaEdicao.precoVenda)
    }
  }

  validaSalvamento() {
    if (this.produtoForm.invalid) {
      this.comumService.openMessageError("Campos Obrigatórios!", "Um ou mais campos obrigatórios não foram preenchidos corretamente");
      throw new Error();
    }

    if (!this.produto) {
      this.salvaProduto();
      return;
    }

    let novaDescricao = this.descricao.value;
    let novoCusto = this.custo.value;
    let descricao = this.produto.descricao;
    let custo = this.produto.custo;

    if (novaDescricao !== descricao || novoCusto !== custo) {
      this.atualizaProduto();
    }
  }

  private salvaProduto() {
    let createProduto: CreateProdutoDto = {
      descricao: this.descricao.value || ''
    }
    if (this.custo.value) {
      createProduto.custo = Number(this.custo.value)
    }
    this.produtoService.cadastraProduto(createProduto).subscribe({
      next: (produto: Produto) => {
        this.comumService.openSuccessMessage("Sucesso", "O produto foi salvo com sucesso!")
        this.produto = produto;
        this.inicializaValoresProduto();
      }
    })
  }

  private atualizaProduto() {
    let createProduto: CreateProdutoDto = {
      descricao: this.descricao.value || '',
      custo: Number(this.custo.value || 0)
    }

    this.produtoService.atualizaProduto(createProduto, this.produto.id).subscribe({
      next: (produto: Produto) => {
        this.comumService.openSuccessMessage("Sucesso", "O produto foi alterado com sucesso!")
        this.produto = produto,
          this.inicializaValoresProduto();
      }
    })

  }

  openCadastroDialog(produtoLoja?: ProdutoLoja) {
    if (!this.produto) {
      this.comumService.openMessageError("Produto necessário!", "É necessário cadastrar um produto para poder cadastrar preços de venda!")
      throw new Error();
    }
    this.loja.enable();
    if (produtoLoja) {
      this.produtoLojaEdicao = produtoLoja;
      this.loja.disable();
    }
    this.dialogPreco = true;
    this.carregaLojas();
  }

  closeDialogPreco() {
    this.dialogPreco = false;
    this.produtoLojaEdicao = undefined!;
    this.lojaPrecoVendaForm.reset();
  }

  private confirmarExclusaoProdutoLoja(produtoLoja: ProdutoLoja) {
    this.confirmationService.confirm({
      message: 'Deseja confirmar a exclusão desse(s) registro(s)?',
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
      accept: () => this.excluirProdutoLoja(produtoLoja.id)
    })
  }

  private excluirProdutoLoja(id: number) {
    this.produtoLojaService.apagaProdutoLoja(id).subscribe({
      next: (produtoLoja: ProdutoLoja) => {
        this.carregaProdutoLojaPorProduto(this.produto.id)
        this.comumService.openSuccessMessage('Sucesso!', 'Registro deletado com sucesso!')
      }
    })
  }


  confirmarExclusaoProduto() {
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
      accept: () => this.excluiProduto()
    })
  }

  private excluiProduto() {
    this.produtoService.excluiProduto(this.produto.id).subscribe({
      next: () => {
        this.comumService.openSuccessMessage('Sucesso!', 'O produto e seus registros correspondentes foram deletados com sucesso!')
        this.router.navigate([['/produto']]);
      }
    })
  }

  private carregaLojas() {
    this.lojaService.buscaLojas().subscribe({
      next: (lojas: Loja[]) => {
        this.lojaList = lojas;
        this.verificaEdicaoProdutoLoja();
      }
    })
  }

  salvarProdutoLoja() {
    if (this.lojaPrecoVendaForm.invalid || (!this.loja.value || !this.precoVenda.value)) {
      this.comumService.openMessageError("Campos Obrigatórios!", "Um ou mais campos obrigatórios não foram preenchidos corretamente")
      throw new Error();
    }

    let produtoLoja: ProdutoLoja = new ProdutoLoja(
      0,
      this.loja.value.id,
      this.loja.value.descricao,
      this.precoVenda.value
    );

    if (this.produtoLojaEdicao) {
      produtoLoja.id = this.produtoLojaEdicao.id;
      this.alteraProdutoLoja(produtoLoja);
      this.closeDialogPreco();
      return;
    }

    this.salvaProdutoLoja(produtoLoja);
    this.lojaPrecoVendaForm.reset();
  }

  private alteraProdutoLoja(produtoLoja: ProdutoLoja) {
    let req: CreateProdutoLojaDto = {
      idProduto: this.produto.id,
      idLoja: produtoLoja.idLoja,
      precoVenda: Number(produtoLoja.precoVenda)
    }

    this.produtoLojaService.atualizaProdutoLoja(req, produtoLoja.id).subscribe({
      next: (novoProdutoLoja: ProdutoLoja) => {
        this.carregaProdutoLojaPorProduto(this.produto.id)
        this.comumService.openSuccessMessage('Sucesso!', 'Registro atualizado com sucesso!')
      }
    })
  }

  private salvaProdutoLoja(produtoLoja: ProdutoLoja) {
    let req: CreateProdutoLojaDto = {
      idProduto: this.produto.id,
      idLoja: produtoLoja.idLoja,
      precoVenda: Number(produtoLoja.precoVenda)
    }

    this.produtoLojaService.cadastraProdutoLoja(req).subscribe({
      next: (novoProdutoLoja: ProdutoLoja) => {
        this.carregaProdutoLojaPorProduto(this.produto.id)
        this.comumService.openSuccessMessage('Sucesso!', 'Registro criado com sucesso!')
      }
    })
  }

  lazyLoadEvent(event: {
    event: TableLazyLoadEvent
  }) {
    if (this.produto) {
      const first = event.event.first ?? 0;
      const rows = event.event.rows ?? this.limitDadosProdutos;
      const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;
      this.pageProdutos = page;
      this.limitDadosProdutos = rows;

      this.carregaProdutoLojaPorProduto(this.produto.id);
    }
  }


  get codigo() { return this.produtoForm.controls.codigo; }
  get descricao() { return this.produtoForm.controls.descricao; }
  get custo() { return this.produtoForm.controls.custo; }

  get loja() { return this.lojaPrecoVendaForm.controls.loja };
  get precoVenda() { return this.lojaPrecoVendaForm.controls.precoVenda };

}
