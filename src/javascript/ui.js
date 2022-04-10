/*jslint node: true */
/*global debug, document */

"use strict";

/**
 * Create, update or remove elements
 */
const Ui = {
	element: null,

	/**
	 * Does the element exist in the DOM
	 * @param {string} id Element id
	 * @return {boolean} status
	 */
	isElement: function(id) {
		var status = false;
		this.element = null;

		if (typeof id !== 'undefined') {
			this.element = document.getElementById(id);

			if (this.element !== null) { // Element found
				status = true;

			} else {
				Debug.log('Element not Found:' + id);
			}
		}

		return status;
	},

	/**
	 * Set or change the value of an element's textContent
	 * @param {string} element Element id
	 * @param {string} data
	 */
	content: function(id, value) {
		if (this.isElement(id) === true && typeof value !== 'undefined') {
			this.element.textContent = value;
		}
	},

	/**
	 * Display an element by remove the CSS class .hide
	 * @param {string} id Element id
	 * @param {boolean} boolean
	 */
	display: function(id) {

		if (this.isElement(id) === true) {
			this.removeClass(id, 'hide');
		}
	},

	/**
	 * Hide an element by adding the CSS class .hide
	 * @param {string} id Element id
	 */
	hide: function(id) {

		if (this.isElement(id) === true) {
			this.addClass(id, 'hide');
		}
	},

	/*
	 * Is the element displayed
	 * @param {string} id Element id
	 */
	isDisplayed: function (id) {
		if (this.isElement(id) === true) {
			var display = window.getComputedStyle(this.element).display;

			if (display !== 'none') {
				return true;
			}
		}

		return false;
	},

	/**
	 * Add a class to an element
	 * @param {string} id Element id
	 * @param {string} value Class name
	 */
	addClass: function(id, value) {
		if (this.isElement(id) === true && typeof value !== 'undefined') {
			this.element.classList.add(value);
		}
	},

	/**
	 * Remove a class from an element
	 * @param {string} id Element id
	 * @param {string} value Class name
	 */
	removeClass: function(id, value) {
		if (this.isElement(id) === true && typeof value !== 'undefined') {
			this.element.classList.remove(value);
		}
	},

	/**
	 * Enable an input element
	 * @param {string} id Element id
	 */
	enableInput: function(id) {
		if (this.isElement(id) === true) {
			this.element.disabled = false;
		}
	},
	
	/**
	 * Disable an input element
	 * @param {string} id Element id
	 */
	disableInput: function(id) {
		if (this.isElement(id) === true) {
			this.element.disabled = true;
		}
	},
	
	/**
	 * Set or change an element's title
	 * @param {string} id Element id
	 * @param {boolean} value
	 */
	title: function(id, value) {
		if (this.isElement(id) === true && typeof value !== 'undefined') {
			this.element.title = value;
		}
	},
	
	/**
	 * Set or change an element's attribute
	 * @param {string} id Element id
	 * @param {string} attr Attribute name
	 * @param {string} value Attribute value
	 */
	attribute: function(id, attr, value) {
		if (this.isElement(id) === true && typeof attr !== 'undefined' && typeof value !== 'undefined') {
			this.element.setAttribute(attr, value);
		}
	},
	
	/**
	 * Remove an attribute from an element
	 * @param {string} id Element id
	 * @param {string} attr Attribute name
	 */
	attributeRemove: function(id, attr) {
		if (this.isElement(id) === true && typeof attr !== 'undefined') {
			if (this.element.hasAttribute(attr)) {
				this.element.removeAttribute(attr);
			}
		}
	}
}
