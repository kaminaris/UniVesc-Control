import { IonicModule }     from '@ionic/angular';
import { NgModule }        from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { DebugTabPage }    from 'src/app/Module/Debug/DebugTabPage';
import { DebugTabRouting } from 'src/app/Module/Debug/DebugTabRouting';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		DebugTabRouting
	],
	declarations: [DebugTabPage]
})
export class DebugTabModule {
}
