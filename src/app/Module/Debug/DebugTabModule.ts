import { IonicModule }     from '@ionic/angular';
import { NgModule }        from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { DebugTabPage }    from 'src/app/Module/Debug/DebugTabPage';
import { DebugTabRouting } from 'src/app/Module/Debug/DebugTabRouting';
import { SharedModule }    from 'src/app/Module/Shared/SharedModule';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		DebugTabRouting,
		SharedModule
	],
	declarations: [DebugTabPage]
})
export class DebugTabModule {
}
