import { IonicModule }        from '@ionic/angular';
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { SettingsTabPage }    from './SettingsTabPage';
import { SettingsTabRouting } from './SettingsTabRouting';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		SettingsTabRouting
	],
	declarations: [SettingsTabPage]
})
export class SettingsTabModule {
}
