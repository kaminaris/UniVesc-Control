import { IonicModule }        from '@ionic/angular';
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { SharedModule }       from 'src/app/Module/Shared/SharedModule';
import { RealTimeTabPage }    from './RealTimeTabPage';
import { RealTimeTabRouting } from './RealTimeTabRouting';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		RealTimeTabRouting,
		SharedModule
	],
	declarations: [RealTimeTabPage]
})
export class RealTimeTabModule {
}
