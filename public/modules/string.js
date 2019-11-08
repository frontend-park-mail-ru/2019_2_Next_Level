/**
 * Uppers first letter
 * @returns {string}
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

if (typeof String.prototype.trim === 'undefined') {
	/**
	 * Trims extra whitespaces
	 * @returns {string}
	 */
	String.prototype.trim = function() {
		return String(this).replace(/^\s+|\s+$/g, '');
	};
}
