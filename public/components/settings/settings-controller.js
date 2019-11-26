import SettingsModel from './settings-model.js';
import SettingsView from './settings-view.js';

export default class SettingsController {
	/**
	 * @constructor
	 */
	constructor() {
		this.settingsModel = new SettingsModel();
		this.settingsView = new SettingsView(this.settingsModel);
	}
}
