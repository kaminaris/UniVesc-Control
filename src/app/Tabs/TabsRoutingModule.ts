import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage }             from './TabsPage';

const routes: Routes = [
	{
		path: 'tabs',
		component: TabsPage,
		children: [
			{
				path: 'real-time',
				loadChildren: () => import('../RealTimeTab/RealTimeTabModule').then(m => m.RealTimeTabModule)
			},
			{
				path: 'control',
				loadChildren: () => import('../ControlTab/ControlTabModule').then(m => m.ControlTabModule)
			},
			{
				path: 'settings',
				loadChildren: () => import('../SettingsTab/SettingsTabModule').then(m => m.SettingsTabModule)
			},
			{
				path: '',
				redirectTo: '/tabs/real-time',
				pathMatch: 'full'
			}
		]
	},
	{
		path: '',
		redirectTo: '/tabs/real-time',
		pathMatch: 'full'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)]
})
export class TabsPageRoutingModule {
}
