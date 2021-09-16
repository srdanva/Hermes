import { AuthGuard } from './../shared/guard/auth.guard';
import { AccountComponent } from './account/account.component';
import { MainComponent } from './main/main.component';
import { LayoutComponent } from './layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: '', component: LayoutComponent, redirectTo: 'main' },
    { path: 'main', component: MainComponent },
    { path: 'layout', component: AccountComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
