import { IonicModule }               from '@ionic/angular';
import { NgModule }                  from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';
import { ConnectionStatusComponent } from 'src/app/Module/Shared/Component/ConnectionStatusComponent';
import { FileSizePipe }              from 'src/app/Module/Shared/Pipe/FileSizePipe';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule
	],
	declarations: [ConnectionStatusComponent, FileSizePipe],
	exports: [ConnectionStatusComponent, FileSizePipe]
})
export class SharedModule {
}
