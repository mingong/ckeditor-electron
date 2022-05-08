/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, setTimeout */


/**
* Creates a notification and appends it to the `.main__content` element.
*
* @param {String} title A title of the notification.
* @param {String} message A message to display in the notification.
*
* @returns {Object} A notification element.
*/
window.createNotification = function( title, message ) {
	const notificationTemplate = `
		<h3 class="main__notification-title">${ title }</h3>
		<div class="main__notification-body">
			${ message }
		</div>
	`;

	const notification = document.createElement( 'div' );
	const close = document.createElement( 'button' );

	close.classList.add( 'main__notification-close' );
	close.innerText = '✕';
	close.setAttribute( 'aria-label', 'Close the notification' );

	notification.classList.add( 'main__notification', 'notice' );
	notification.innerHTML = notificationTemplate;
	// ATM we support only top-right position.
	notification.style.top = window.getViewportTopOffsetConfig() + 10 + 'px';
	notification.style.right = '10px';
	notification.appendChild( close );

	const activeNotifications = document.querySelectorAll( '.main__notification' );

	// Translate the position of multiple notifications (just in case).
	if ( activeNotifications.length > 0 ) {
		const moveOffset = activeNotifications.length * 10;

		notification.style.top = parseInt( notification.style.top ) + moveOffset + 'px';
		notification.style.right = parseInt( notification.style.right ) + moveOffset + 'px';
	}

	// Append notification to the `.main__content` element.
	const main = document.querySelector( '.main__content' );
	main.appendChild( notification );

	close.addEventListener( 'click', () => {
		main.removeChild( notification );
	} );

	return notification;
};

/**
 * Returns the `config.ui.viewportOffset.top` config value for editors using floating toolbars that
 * stick to the top of the viewport to remain visible to the user.
 *
 * The value is determined in styles by the `--ck-snippet-viewport-top-offset` custom property
 * and may differ e.g. according to the used media queries.
 *
 * @returns {Number} The value of the offset.
 */
window.getViewportTopOffsetConfig = function() {
	const documentElement = document.documentElement;

	return parseInt( window.getComputedStyle( documentElement ).getPropertyValue( '--ck-snippet-viewport-top-offset' ) );
};
