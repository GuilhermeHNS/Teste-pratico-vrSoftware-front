import { Routes } from '@angular/router';
import { ProdutoComponent } from './produto/produto.component';
import { CadastroProdutoComponent } from './cadastro-produto/cadastro-produto.component';

export const routes: Routes = [
    {
        path:'',
        pathMatch: 'full',
        redirectTo: 'produto'
    },
    {
        path: 'produto',
        component: ProdutoComponent
    },
    {
        path: 'produto/cadastro',
        component: CadastroProdutoComponent
    }
];
