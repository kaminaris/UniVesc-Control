import { IonicModule }       from '@ionic/angular';
import { NgModule }          from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule }                     from 'src/app/Module/Shared/SharedModule';
import { ControlTabPage }    from './ControlTabPage';
import { ControlTabRouting } from './ControlTabRouting';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		ControlTabRouting,
		SharedModule,
		ReactiveFormsModule
	],
	declarations: [ControlTabPage]
})
export class ControlTabModule {
}
