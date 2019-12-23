import {renderFest} from '../../../modules/view-utility';
import {InsertBeforeEndRenderer} from '../../../modules/renderer';
import './alert.tmpl.js';
import styles from './alert.scss';

export default class Alert {
	static alert;
	static opacityTimer;
	static removeTimer;
	static level;

	static show(header='', message='', level='info', timeout=1000) {
		Alert.setText(header, message, level);
		Alert.vanishAlert(timeout);
	}

	static setText(header, message, level) {
		header=header.toUpperCase();
		if (!Alert.alert) {
			renderFest(InsertBeforeEndRenderer,
				'body',
				'components/common/alert/alert.tmpl',
				{header, message});
			Alert.alert = document.body.querySelector('.alert');
		} else {
			Alert.alert.querySelector('.alert__header').innerHTML = header;
			Alert.alert.querySelector('.alert__body').innerHTML = message;
		}
		if (['info', 'warn', 'error'].indexOf(level) < 0) {
			level = 'info';
		}
		Alert.alert.classList.remove(`alert_${Alert.level}`);
		Alert.alert.classList.add(`alert_${level}`);
		Alert.level = level;
	}

	static vanishAlert(timeout) {
		if (Alert.opacityTimer) {
			clearTimeout(Alert.opacityTimer);
		}
		Alert.opacityTimer = setTimeout(() => {
			Alert.alert.style.opacity = '0';
			Alert.removeAlert();
			Alert.opacityTimer = null;
		}, timeout);
	}

	static removeAlert() {
		if (Alert.removeTimer) {
			clearTimeout(Alert.removeTimer);
		}
		setTimeout(() => {
			document.body.removeChild(Alert.alert);
			Alert.alert = null;
			Alert.removeTimer = null;
		}, styles.vanish_durations*1000);
	}

}