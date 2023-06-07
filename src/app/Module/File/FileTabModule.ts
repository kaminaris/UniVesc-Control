import { IonicModule }        from '@ionic/angular';
import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { FileTabPage }    from 'src/app/Module/File/FileTabPage';
import { FileTabRouting } from 'src/app/Module/File/FileTabRouting';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		FileTabRouting
	],
	declarations: [FileTabPage]
})
export class FileTabModule {
}
