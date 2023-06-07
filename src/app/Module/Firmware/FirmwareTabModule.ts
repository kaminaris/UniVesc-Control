import { IonicModule }        from '@ionic/angular';
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { FirmwareTabPage }    from 'src/app/Module/Firmware/FirmwareTabPage';
import { FirmwareTabRouting } from 'src/app/Module/Firmware/FirmwareTabRouting';
import { SharedModule }       from 'src/app/Module/Shared/SharedModule';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		FirmwareTabRouting,
		SharedModule
	],
	declarations: [FirmwareTabPage]
})
export class FirmwareTabModule {
}
