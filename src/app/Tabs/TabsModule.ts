import { IonicModule }           from '@ionic/angular';
import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';
import { FormsModule }           from '@angular/forms';
import { TabsPage }              from './TabsPage';
import { TabsPageRoutingModule } from './TabsRoutingModule';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		TabsPageRoutingModule
	],
	declarations: [TabsPage]
})
export class TabsPageModule {
}
