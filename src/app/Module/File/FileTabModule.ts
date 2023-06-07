import { IonicModule }        from '@ionic/angular';
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { FileTabPage }    from 'src/app/Module/File/FileTabPage';
import { FileTabRouting } from 'src/app/Module/File/FileTabRouting';
import { SharedModule }       from 'src/app/Module/Shared/SharedModule';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		FileTabRouting,
		SharedModule
	],
	declarations: [FileTabPage]
})
export class FileTabModule {
}
