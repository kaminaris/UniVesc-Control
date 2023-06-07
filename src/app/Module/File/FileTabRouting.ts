import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileTabPage }      from './FileTabPage';

const routes: Routes = [
	{
		path: '',
		component: FileTabPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FileTabRouting {
}
