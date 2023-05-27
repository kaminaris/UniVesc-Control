import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlTabPage }       from './ControlTabPage';

const routes: Routes = [
	{
		path: '',
		component: ControlTabPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ControlTabRouting {
}
