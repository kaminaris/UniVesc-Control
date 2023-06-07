import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DebugTabPage }      from './DebugTabPage';

const routes: Routes = [
	{
		path: '',
		component: DebugTabPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DebugTabRouting {
}
