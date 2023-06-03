import { enableProdMode }         from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule }                                                         from './app/AppModule';
import { BinaryConverter, FloatConverter, NumberConverter, StringConverter } from './app/BinarySerializer';

import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}
BinaryConverter.registerConverter('string', new StringConverter());
BinaryConverter.registerConverter('number', new NumberConverter());
BinaryConverter.registerConverter('float', new FloatConverter());
platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.log(err));
