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
import { Produto } from '../models/Produto';
import { ProdutoLoja } from '../models/produto-Loja';
import { ComumService } from '../services/comum.service';
import { LojaService } from '../services/loja.service';
import { ProdutoLojaService } from '../services/produto-loja.service';
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
  newProduto!: Produto;
  produtoLojaList!: ProdutoLoja[]
  produtoLojaEdicao!: ProdutoLoja;
  newProdutoLoja: ProdutoLoja[] = [];
  idProdutoLojaUpdate: number[] = [];
  idProdutoLojaDelete: number[] = [];

  lojaList!: Loja[];
  cols: Column[] = [];
  dialogPreco: boolean = false;

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

  openCadastroDialog(produtoLoja?: ProdutoLoja) {
    if (produtoLoja) {
      this.produtoLojaEdicao = produtoLoja;
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
      message: 'Deseja confirmar a exclusão desse registro?',
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
      next: () => {
        if (this.produto) {
          this.carregaProdutoLojaPorProduto(this.produto.id)
        }
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
      this.alteraProdutoLoja(produtoLoja);
      this.closeDialogPreco();
      return;
    }

    this.newProdutoLoja.push(produtoLoja);
    this.produtoLojaList.push(produtoLoja);
    this.lojaPrecoVendaForm.reset();
  }

  alteraProdutoLoja(produtoLoja: ProdutoLoja) {
    const idLojaAlterado = produtoLoja.idLoja !== this.produtoLojaEdicao.idLoja;
    const precoVendaAlterado = produtoLoja.precoVenda !== this.produtoLojaEdicao.precoVenda;

    if (idLojaAlterado || precoVendaAlterado) {
      const index = this.produtoLojaList.findIndex(pl => pl.id === this.produtoLojaEdicao?.id);

      if (index === -1) return;
      this.produtoLojaList = this.produtoLojaList.map((item, i) => {
        if (i !== index) return item;
        if (item.id > 0) {
          this.idProdutoLojaUpdate.push(item.id)
        } else {
          let index = this.newProdutoLoja.findIndex((l) => l.id == item.id);
          this.newProdutoLoja[index] = produtoLoja;
        }
        const lojaEncontrada = this.lojaList.find(l => l.id === produtoLoja.idLoja);
        return {
          ...item,
          idLoja: produtoLoja.idLoja,
          descricao: lojaEncontrada?.descricao ?? '',
          precoVenda: produtoLoja.precoVenda
        };
      });
    }
  }

  get codigo() { return this.produtoForm.controls.codigo; }
  get descricao() { return this.produtoForm.controls.descricao; }
  get custo() { return this.produtoForm.controls.custo; }

  get loja() { return this.lojaPrecoVendaForm.controls.loja };
  get precoVenda() { return this.lojaPrecoVendaForm.controls.precoVenda };

}
