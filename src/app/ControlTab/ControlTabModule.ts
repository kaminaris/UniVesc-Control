import { IonicModule }       from '@ionic/angular';
import { NgModule }          from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { ControlTabPage }    from './ControlTabPage';
import { ControlTabRouting } from './ControlTabRouting';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		ControlTabRouting
	],
	declarations: [ControlTabPage]
})
export class ControlTabModule {
}
