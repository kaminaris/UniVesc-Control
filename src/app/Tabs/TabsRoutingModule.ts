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
				loadChildren: () => import('../Module/RealTime/RealTimeTabModule').then(m => m.RealTimeTabModule)
			},
			{
				path: 'control',
				loadChildren: () => import('../Module/Control/ControlTabModule').then(m => m.ControlTabModule)
			},
			{
				path: 'debug',
				loadChildren: () => import('../Module/Debug/DebugTabModule').then(m => m.DebugTabModule)
			},
			{
				path: 'gps',
				loadChildren: () => import('../Module/Gps/GpsTabModule').then(m => m.GpsTabModule)
			},
			{
				path: 'firmware',
				loadChildren: () => import('../Module/Firmware/FirmwareTabModule').then(m => m.FirmwareTabModule)
			},
			{
				path: 'file',
				loadChildren: () => import('../Module/File/FileTabModule').then(m => m.FileTabModule)
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
