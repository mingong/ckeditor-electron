/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

/*
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/src/ckeditor';


*/
const { ipcRenderer } = require( 'electron' );
const { pathToFileURL } = require( 'url' );
const path = require( 'path' );

let isDirty = false;
/*
let screenToggleState = false;
*/

let persistFilename = "untitled";

DecoupledDocumentEditor
	.create( document.querySelector( '.document-editor__editable' ), {
		/*
		codeBlock: {
			languages: [
				
				{ language: 'plaintext', label: 'Plain text' }, // The default language.
				
				//  Do not render the CSS class for the plain text code blocks.
				{ language: 'plaintext', label: 'Plain text', class: '' },
				{ language: 'c', label: 'C' },
				{ language: 'cs', label: 'C#' },
				{ language: 'cpp', label: 'C++' },
				{ language: 'css', label: 'CSS' },
				{ language: 'diff', label: 'Diff' },
				{ language: 'html', label: 'HTML' },
				{ language: 'java', label: 'Java' },
				//  Use the "js" class for JavaScript code blocks.
				//  Note that only the first ("js") class will determine the language of the block when loading data.
				{ language: 'javascript', label: 'JavaScript', class: 'js javascript js-code' },
				//  Use the "php-code" class for PHP code blocks.
				{ language: 'php', label: 'PHP', class: 'php-code' },
				//  Python code blocks will have the default "language-python" CSS class.
				{ language: 'python', label: 'Python' },
				{ language: 'ruby', label: 'Ruby' },
				{ language: 'typescript', label: 'TypeScript' },
				{ language: 'xml', label: 'XML' }
			] }
		*/
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		const toolbarContainer = document.querySelector( '.document-editor__toolbar' );

		toolbarContainer.appendChild( editor.ui.view.toolbar.element );

		window.editor = editor;
		
		editor.editing.view.focus();
		
		handleDataChanges( editor );
		
		const pickLinkCommand = editor.commands.get( 'pickLink' );
		const addLinkCommand = editor.commands.get( 'addLink' );
		const pickPictureCommand = editor.commands.get( 'pickPicture' );
		const addPictureCommand = editor.commands.get( 'addPicture' );

		pickLinkCommand.on( 'execute', () => {
			file_picker_callback( file_picker, /*'value', */{ filetype: 'file' } );
		} );
		addLinkCommand.on( 'execute', () => {
			ipcRenderer.send( 'call-addLink' );
		} );
		pickPictureCommand.on( 'execute', () => {
			file_picker_callback( file_picker, /*'value', */{ filetype: 'image' } );
		} );
		addPictureCommand.on( 'execute', () => {
			ipcRenderer.send( 'call-addPicture' );
		} );
		
		// "Handle individual keyboard keys"
		/*
		editor.editing.view.document.on( 'keydown', ( evt, data ) => {
			var key = data.keyCode || data.which;

			if ( key === 27 && screenToggleState === true ) {
				ipcRenderer.send( 'call-toggleScreen' );
			}

			// "Tab key: insert an em dash-sized space and disable normal tab key handling"
			if ( key === 9 ) {
				const content = '&emsp;';
				const viewFragment = editor.data.processor.toView( content );
				const modelFragment = editor.data.toModel( viewFragment );

				editor.model.insertContent( modelFragment );
				data.preventDefault();
				data.stopPropagation();
				evt.stop();
			}
		}, { priority: 'highest' } );
		editor.keystrokes.set( 'Ctrl+E', ( data, cancel ) => {
			if ( screenToggleState === true ) {
				ipcRenderer.send( 'call-toggleScreen' );
			}
		} );
		// "Tab key: insert an em dash-sized space and disable normal tab key handling"
		editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			var key = data.keyCode || data.which;
			
			const content = '&emsp;';
			const viewFragment = editor.data.processor.toView( content );
			const modelFragment = editor.data.toModel( viewFragment );

			editor.model.insertContent( modelFragment );
			data.preventDefault();
			data.stopPropagation();
			//  Prevent the default (native) action and stop the underlying keydown event
			//  so no other editor feature will interfere.
			cancel();
		} );
		
		*/
		ipcRenderer.send( "call-try-open" );
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );

//  Listen to new changes
function handleDataChanges( editor ) {
	editor.model.document.on( "change:data", () => {
		isDirty = true;
		
		ipcRenderer.send( "call-updateTitle", persistFilename + "*" );
	} );
}

function set() {
	var path = ipcRenderer.sendSync( 'call-set' );

	if ( path.length > 0 ) {
		change_cwd( path );
	}
}

/*
function tes() {
	var path = ipcRenderer.sendSync( 'call-eso' );

	if ( path.length > 0 ) {
		change_cwd( path );
	}
}

*/
//  Upon opening new file
ipcRenderer.on( "newly-made-file", function ( event, path ) {
	change_cwd( path );

	editor.setData( "" );

	isDirty = false;
	
	persistFilename = "untitled";
	
	ipcRenderer.send( "call-updateTitle", persistFilename );
} );

//  Upon opening existed file
ipcRenderer.on( "opened-file", function ( event, path, filename, data ) {
	change_cwd( path );
	
	persistFilename = filename;

	editor.setData( data );

	isDirty = false;
	
	ipcRenderer.send( "call-updateTitle", filename );
} );

//  Change current working directory
function change_cwd( newPath ) {
	var headx = document.head,
		basex;

	if ( headx.getElementsByTagName( "base" ).length > 0 ) {
		basex = headx.getElementsByTagName( "base" )[ 0 ];
	} else {
		basex = document.createElement( "base" );
		
		headx.appendChild( basex );
	}
	
	basex.setAttribute( "href", pathToFileURL( newPath ).href + "/" );
}

//  Upon saving MarkDown
ipcRenderer.on( "saved-file", function ( event, pathname, filename ) {
	change_cwd( pathname );
	
	isDirty = false;
	
	ipcRenderer.send( "call-save-", editor.getData()/* + "\r\n"*/ );
	
	ipcRenderer.send( "call-updateTitle", filename );
	
	persistFilename = filename;
} );

//  Upon exporting Plain Html
ipcRenderer.on( "exported-file", function ( event, /*pathname, filename, */withcss ) {
	/*
	change_cwd( pathname );
	
	isDirty = false;
	
	*/
	ipcRenderer.send( "call-export-", editor.data.processor.toHtml( editor.getData() )/* + "\r\n"*/, withcss );
	/*
	
	ipcRenderer.send( "call-updateTitle", filename );
	
	persistFilename = filename;
	*/
} );

//  Pick file
function file_picker( fileType, pathURL, extraPara ) {
	// "Provide file and text for the link dialog"
	if ( fileType === 'file' ) {
		/*
		window.editor.execute( 'link', pathURL );
		*/
		const content = '[' + extraPara.text + ']' + '(' + pathURL + ')';
		const viewFragment = editor.data.processor.toView( content );
		const modelFragment = editor.data.toModel( viewFragment );

		editor.model.insertContent( modelFragment );
	}
	
	// "Provide image and alt text for the im"
	if ( fileType === 'image' ) {
		/*window.*/editor.model.change( writer => {
			const imageElement = writer.createElement( 'imageBlock', {
				src: pathURL,
				alt: extraPara.alt
			} );

			/*window.*/editor.model.insertContent( imageElement, editor.model.document.selection );
		} );
	}
}

// "and here's our custom image picker"
function file_picker_callback( callback, /*value, */meta ) {
	var filetypex = meta.filetype;
	
	var msgObject = ipcRenderer.sendSync( 'call-get', filetypex );
	
	var filepath = msgObject.filePath;
	var pathname = msgObject.pathName;
	
	if ( filepath.length > 0 && pathname.length > 0 ) {
		var filename = path.basename( pathname );
		
		var fileURL = pathToFileURL( pathname ).href;
		var pathURL = pathToFileURL( filepath ).href;
		
		var result;
		
		fileURL = fileURL.substring( ( pathURL + "/" ).length );
		
		// "P"
		if ( filetypex === 'file' ) {
			callback( filetypex, fileURL, { text: filename } );
			
			result = ipcRenderer.sendSync( 'call-should-set' );
			
			if ( result ) {
				ipcRenderer.send( 'call-tes', filepath );
				
				change_cwd( filepath );
			}
		}
		
		// ""
		if ( filetypex === 'image' ) {
			result = ipcRenderer.sendSync( 'call-should-set' );
			
			if ( result ) {
				ipcRenderer.send( 'call-tes', filepath );
				
				change_cwd( filepath );
			}
			
			callback( filetypex, fileURL, { alt: filename } );
		}
	}
}

/*
//  Upon toggleScreen on/off
ipcRenderer.on( 'toggleScreen-change', function () {
	if ( screenToggleState === true ) {
		screenToggleState = false;
	} else {
		screenToggleState = true;
	}

	editor.editing.view.focus();
} );

*/
//  addPicture
ipcRenderer.on( 'addPicture', function ( event, imageUrl ) {
	/*window.*/editor.model.change( writer => {
		if ( imageUrl.length > 0 ) {
			const imageElement = writer.createElement( 'imageBlock', {
				src: imageUrl
			} );
			
			/*window.*/editor.model.insertContent( imageElement, editor.model.document.selection );
		}
	} );
} );

//  addLink
ipcRenderer.on( 'addLink', function ( event, linkUrl ) {
	/*window.*/editor.model.change( writer => {
		if ( linkUrl.length > 0 ) {
			const linkedText = writer.createText( linkUrl, { linkHref: linkUrl } );
			
			/*window.*/editor.model.insertContent( linkedText, editor.model.document.selection );
		}
	} );
} );

ipcRenderer.on( "action", ( event, arg ) => {
	var EditingMode = false;
	
	for ( const command of editor.commands.commands() ) {
		if ( command.isEnabled ) {
			EditingMode = true;
			
			break;
		}
		
	}
	
	if ( EditingMode ) {
		switch (arg) {
			case "call-new":
				var result;
				
				if ( isDirty ) {
					result = ipcRenderer.sendSync( "call-electronConfirm", "Unsaved changes. Continue without saving?" );
					
					if ( result === 0 ) {
						ipcRenderer.send( arg );
					}
				} else {
					result = ipcRenderer.sendSync( "call-electronConfirm", "Close the current file and create a new one?" );
					
					if ( result === 0 ) {
						ipcRenderer.send( arg );
					}
				}
				
				break;
			case "call-open":
			case "call-quit":
				if ( isDirty ) {
					var result = ipcRenderer.sendSync( "call-electronConfirm", "Unsaved changes. Continue without saving?" );
					
					if ( result === 0 ) {
						ipcRenderer.send( arg );
					}
				} else {
					ipcRenderer.send( arg );
				}
				
				break;
			case "call-save":
			case "call-saveAs":
				ipcRenderer.send( arg );
				
				break;
			case "export-plainHtml":
			case "export-html":
				if ( isDirty ) {
					ipcRenderer.send( "call-electronAlert", "Unsaved changes." );
				} else {
					ipcRenderer.send( arg );
				}
				
				break;
			default:
				break;
		}
	}
} );

ipcRenderer.on( "ckeditorAction", ( event, arg ) => {
	switch (arg) {
		case "undo":
		case "redo":
		case "strikethrough":
		case "code":
		case "removeFormat":
		case "todoList":
			window.editor.execute( arg );
			
			break;
		default:
			break;
	}
} );

ipcRenderer.on( "electronAction", ( event, arg ) => {
	switch (arg) {
		case "call-set":
			set();
			/*
			
			editor.editing.view.focus();
			*/
			
			break;
		/*
		case "call-tes":
			tes();
			
			editor.editing.view.focus();
			
			break;
		case "call-toggleScreen":
			ipcRenderer.send( arg );
			
			break;
		*/
		default:
			break;
	}
} );

/*
window.onload = function () {
	editor.editing.view.focus();
};

document.body.addEventListener( "click", function ( e ) {
		var target = e.target || e.srcElement;
		
		//  判断是否匹配目标元素
		if ( target.nodeName.toLocaleLowerCase() === "a" ) {
			if ( e.preventDefault ) {
				e.preventDefault();
			} else {
				window.event.returnValue = true;
			}
			
			var url = target.getAttribute( "href" );
			
			if ( target.getAttribute( "target" ) === "_blank" ) {
				window.open( url );
				
				editor.editing.view.focus();
			} else {
				window.location.href = url;
			}
		}
	} );

*/
window.onresize = function() {
	var height = window.innerHeight;
	
	var height3 = height;
	
	if ( height > 23.703 ) {
		height -= 23.703;
	}
	
	if ( height3 > 237.703 ) {
		height3 -= 237.703;
	}
	
	var heightStr = height.toString() + "px";
	var heightStr3 = height3.toString() + "px";
	
	var sheet = document.styleSheets[ 1 ];
	var rules = sheet.cssRules || sheet.rules;
	var document_editor_rule = rules[ 0 ];
	var ck_editor__editable_rule = rules[ 4 ];

	document_editor_rule.style.height = heightStr;
	ck_editor__editable_rule.style.height = heightStr3;
};
