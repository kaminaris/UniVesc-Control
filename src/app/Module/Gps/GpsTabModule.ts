import { IonicModule }   from '@ionic/angular';
import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { GpsTabPage }    from 'src/app/Module/Gps/GpsTabPage';
import { GpsTabRouting } from 'src/app/Module/Gps/GpsTabRouting';
import { SharedModule }  from 'src/app/Module/Shared/SharedModule';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		GpsTabRouting,
		SharedModule
	],
	declarations: [GpsTabPage]
})
export class GpsTabModule {
}
