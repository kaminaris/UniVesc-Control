import { IonicModule }               from '@ionic/angular';
import { NgModule }                  from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { ConnectionStatusComponent } from 'src/app/Module/Shared/Component/ConnectionStatusComponent';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule
	],
	declarations: [ConnectionStatusComponent],
	exports: [ConnectionStatusComponent]
})
export class SharedModule {
}
