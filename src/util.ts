import {Browser, Page, Response} from 'puppeteer';
import {Config} from './config';
import {Logger} from './logger';
import {disableBlockerInPage} from './adblocker';

export function getSleepTime() {
	return Config.browser.minSleep + (Math.random() * (Config.browser.maxSleep - Config.browser.minSleep));
}

export async function delay(ms: number) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export async function usingResponse<T>(
	browser: Browser,
	url: string,
	cb: (response: (Response | null), page: Page, browser: Browser) => Promise<T>
): Promise<T> {
	return usingPage(browser, async (page, browser) => {
		const response = await page.goto(url, {waitUntil: 'domcontentloaded'});

		return cb(response, page, browser);
	});
}

export async function usingPage<T>(browser: Browser, cb: (page: Page, browser: Browser) => Promise<T>): Promise<T> {
	const page = await browser.newPage();
	page.setDefaultNavigationTimeout(Config.page.navigationTimeout);
	await page.setUserAgent(Config.page.userAgent);

	try {
		return await cb(page, browser);
	} finally {
		try {
			await closePage(page);
		} catch (error) {
			Logger.error(error);
		}
	}
}

export async function closePage(page: Page) {
	await disableBlockerInPage(page);
	await page.close();
}
