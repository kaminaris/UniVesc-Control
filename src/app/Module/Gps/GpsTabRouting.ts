import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GpsTabPage }           from 'src/app/Module/Gps/GpsTabPage';

const routes: Routes = [
	{
		path: '',
		component: GpsTabPage
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class GpsTabRouting {
}
