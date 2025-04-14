import { Routes } from '@angular/router';
import { ProdutoComponent } from './produto/produto.component';

export const routes: Routes = [
    {
        path:'',
        pathMatch: 'full',
        redirectTo: 'produto'
    },
    {
        path: 'produto',
        component: ProdutoComponent
    }
];
