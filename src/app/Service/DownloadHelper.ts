

export class DownloadHelper {

	static clickLink(a: HTMLAnchorElement) {
		try {
			a.dispatchEvent(new MouseEvent('click'));
		}
		catch (e) {
			const evt = document.createEvent('MouseEvents');
			evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
			a.dispatchEvent(evt);
		}
	}

	static saveBlobAs(blob: Blob, fileName = 'download') {
		const URL = window.URL || window.webkitURL;
		const a = document.createElement('a');

		a.download = fileName;
		a.rel = 'noopener';

		// Support blobs
		a.href = URL.createObjectURL(blob);
		setTimeout(() => { URL.revokeObjectURL(a.href); }, 4E4); // 40s
		setTimeout(() => { DownloadHelper.clickLink(a); }, 0);
	}
}
