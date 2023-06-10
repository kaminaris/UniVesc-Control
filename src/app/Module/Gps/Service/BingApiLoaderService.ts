import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class BingApiLoaderService {
	promise?: Promise<string>;
	key = 'AgTTg0uPR-MxMGkgC4bdeNgMTmTsTRNLo7829eZFDMQwB_dCGT2jGENPcaOOcvom';
	url = 'https://www.bing.com/api/maps/mapcontrol?callback=__onBingLoaded&key=' + this.key;

	constructor() {}

	load() {
		// First time 'load' is called?
		if (!this.promise) {

			// Make promise to load
			this.promise = new Promise(resolve => {

				// Set callback for when bing maps is loaded.
				(window as any).__onBingLoaded = (ev: any) => {
					resolve('Bing Maps API loaded');
				};

				// const node = document.createElement('script');
				const node = document.createElement('script');
				node.src = this.url;
				node.type = 'text/javascript';
				node.async = true;
				node.defer = true;
				// _documentRef.getElementsByTagName('head')[0].appendChild(node);
				document.getElementsByTagName('head')[0].appendChild(node);
			});
		}

		// Always return promise. When 'load' is called many times, the promise is already resolved.
		return this.promise;
	}
}
