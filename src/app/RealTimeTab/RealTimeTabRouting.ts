import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RealTimeTabPage }      from './RealTimeTabPage';

const routes: Routes = [
	{
		path: '',
		component: RealTimeTabPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RealTimeTabRouting {
}
