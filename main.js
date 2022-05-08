const { app, BrowserWindow, Menu, dialog, ipcMain } = require( 'electron' );

const url = require( 'url' );
const path = require( 'path' );
const fs = require( 'fs' );

const prompt = require( 'electron-prompt' );

const isDev = process.mainModule.filename.indexOf( 'app.asar' ) < 0;

let mainWindow = null;

let filename = null;
let exportname = null;

let working_directory = "";
let export_directory = "";
let prePathFile = "";

if ( isDev ) {
	process.env[ 'ELECTRON_DISABLE_SECURITY_WARNINGS' ] = true;
}

/*
app.allowRendererProcessReuse = true;

*/
function fileExists( filePath ) {
	try {
		return fs.statSync( filePath ).isFile();
	} catch ( err ) {
		return false;
	}
}

function createWindow() {
	if ( process.platform === "win32" && process.argv.length >= 2 ) {
		let preFilePath = process.argv[ 1 ];
		
		let preNormalizedPath;
		
		if ( path.isAbsolute( preFilePath ) ) {
			preNormalizedPath = path.normalize( preFilePath );
		} else {
			/*
			preNormalizedPath = path.join( __dirname, preFilePath );
			*/
			preNormalizedPath = path.join( process.cwd(), preFilePath );
		}
		
		if ( fileExists( preNormalizedPath ) ) {
			prePathFile = preNormalizedPath;
		}
	}
	
	mainWindow = new BrowserWindow( {
		width: 1040,
		height: 826,
		webPreferences: {
			nodeIntegration: true,
			/*
			devTools: true,
			enableRemoteModule: true,
			*/
			webSecurity: false,
			contextIsolation: false
		}
	} );

	//  and load the index.html of the app.
	mainWindow.loadURL( url.format( {
		pathname: path.join( __dirname, 'index.html' ),
		protocol: 'file:',
		slashes: true
	} ) );

	require( "./src/ipcMain/menu.js" );

	mainWindow.webContents.on( 'did-finish-load', () => {
		mainWindow.setTitle( "CKEditor Electron" );
	} );

	if ( isDev ) {
		//  Open the DevTools.
		/*
		BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		*/
		mainWindow.webContents.openDevTools( { mode: 'detach' } );
	}
	
	mainWindow.on( 'close', ( e ) => {
		e.preventDefault();
		
		mainWindow.webContents.send( 'action', 'call-quit' );
	} );
	mainWindow.on( 'closed', () => mainWindow = null );
}

app.on( 'ready', createWindow );

app.on( 'window-all-closed', () => {
	if ( process.platform !== 'darwin' ) {
		app.quit();
	}
} );

app.on( 'activate', () => {
	if ( mainWindow === null ) {
		createWindow();
	}
} );

ipcMain.on( 'call-set', ( event, arg ) => choose_working_directory( event ) );
/*
ipcMain.on( 'call-eso', ( event, arg ) => esoohc_working_directory( event ) );
*/
ipcMain.on( 'call-should-set', ( event, arg ) => should_change_working_directory( event ) );
ipcMain.on( 'call-tes', ( event, arg ) => change_working_directory( arg ) );
ipcMain.on( 'call-new', ( event, arg ) => newfile() );
ipcMain.on( 'call-try-open', ( event, arg ) => try_open() );
ipcMain.on( 'call-open', ( event, arg ) => open() );
ipcMain.on( 'call-save', ( event, arg ) => save() );
ipcMain.on( 'call-save-', ( event, arg ) => save_( arg ) );
ipcMain.on( 'call-saveAs', ( event, arg ) => saveas() );
ipcMain.on( 'export-plainHtml', ( event, arg ) => export_plain_html() );
ipcMain.on( 'call-export-', ( event, arg, arg3 ) => export_( arg, arg3 ) );
ipcMain.on( 'export-html', ( event, arg ) => export_html() );

ipcMain.on( 'call-quit', ( event, arg ) => app.exit() );
/*
ipcMain.on( 'call-toggleScreen', ( event, arg ) => toggleScreen() );
*/
ipcMain.on( 'call-get', ( event, arg ) => get( event, arg ) );
ipcMain.on( 'call-updateTitle', ( event, arg ) => update_title( arg ) );
ipcMain.on( 'call-electronAlert', ( event, arg ) => electron_alert( arg ) );
ipcMain.on( 'call-electronConfirm', ( event, arg ) => electron_confirm( event, arg ) );
ipcMain.on( 'call-addPicture', ( event, arg ) => addPicture() );
ipcMain.on( 'call-addLink', ( event, arg ) => addLink() );

function choose_working_directory( event ) {
	if ( filename ) {
		dialog.showMessageBox( mainWindow, {
			type: "info",
			detail: "Can Not Choose Working Directory."
		} );
		
		event.returnValue = "";
	} else {
		dialog.showOpenDialog( mainWindow, { properties: [ "openDirectory" ], defaultPath: working_directory } ).then( ( fn ) => {
			if ( fn.canceled ) {
				event.returnValue = "";
			} else {
				var pathName = fn.filePaths[ 0 ];

				change_working_directory( pathName );
				
				event.returnValue = pathName;
			}
		} );
	}
}

/*
function esoohc_working_directory( event ) {
	if ( filename ) {
		dialog.showMessageBox( mainWindow, {
			type: "info",
			detail: "Can Not Esoohc Working Directory."
		} );
		
		event.returnValue = "";
	} else {
		if ( working_directory.length > 0 ) {
			working_directory = "";
			
			dialog.showMessageBox( mainWindow, {
				type: "info",
				detail: "Esoohc Working Directory."
			} );

			change_working_directory( __dirname );

			event.returnValue = __dirname;
		} else {
			dialog.showMessageBox( mainWindow, {
				type: "info",
				detail: "Do Not Need To Esoohc Working Directory."
			} );

			event.returnValue = "";
		}
	}
}

*/
function should_change_working_directory( event ) {
	var return_value;
	
	if ( working_directory.length > 0 ) {
		return_value = false;
	} else {
		return_value = true;
	}
	
	event.returnValue = return_value;
}

function newfile() {
	filename = null;
	exportname = null;
	
	working_directory = "";
	export_directory = "";
	
	mainWindow.webContents.send( "newly-made-file", __dirname );
}

function try_open() {
	//  Open prePathFile
	if ( prePathFile.length > 0 ) {
		fs.readFile( prePathFile, "utf8", ( err, data ) => {
			if ( err ) throw err;
			
			var pathName = path.dirname( prePathFile );
			
			change_working_directory( pathName );
			
			export_directory = "";

			filename = path.basename( prePathFile );
			
			exportname = null;
			
			mainWindow.webContents.send( "opened-file", pathName, filename, data );
		} );
	}
}

function open() {
	dialog.showOpenDialog( mainWindow, { properties: [ "openFile" ], defaultPath: working_directory } ).then( ( fn ) => {
		//  Prevent error message if click cancel
		if ( fn.canceled ) {
			return;
		}
		
		var filePath = fn.filePaths[ 0 ];

		fs.readFile( filePath, "utf8", ( err, data ) => {
			if ( err ) throw err;
			
			var pathName = path.dirname( filePath );
			
			change_working_directory( pathName );
			
			export_directory = "";

			filename = path.basename( filePath );
			
			exportname = null;
			
			mainWindow.webContents.send( "opened-file", pathName, filename, data );
		} );

		return;
	} );
}

function save() {
	if ( filename ) {
		mainWindow.webContents.send( "saved-file", working_directory, filename );
		
		return;
	} else {
		var fullPath = working_directory;

		var options = {
			filters: [
				{ name: "Markdown Files", extensions: [ "md", "markdown" ] },
				{ name: "All Files", extensions: [ "*" ] }
			],

			defaultPath: fullPath
		};

		dialog.showSaveDialog( mainWindow, options ).then( ( n ) => {
			if ( n.canceled ) {
				return;
			} else {
				var filepath = n.filePath;
				
				var pathname = path.dirname( filepath );
				
				change_working_directory( pathname );
				
				if ( path.extname( filepath ) === "" ) {
					filepath += ".md";
				}
				
				filename = path.basename( filepath );
				
				mainWindow.webContents.send( "saved-file", pathname, filename );
				
				return;
			}
		} );
	}
}

function save_( result ) {
	var fullpath;
	
	fullpath = path.join( working_directory, filename );
	
	fs.writeFile( fullpath, result, ( err ) => {
		if ( err ) throw err;
	} );
}

function saveas() {
	var fullPath;

	if ( filename ) {
		fullPath = path.join( working_directory, filename );
	} else {
		fullPath = working_directory;
	}
	
	var options = {
		filters: [
			{ name: "Markdown Files", extensions: [ "md", "markdown" ] },
			{ name: 'All Files', extensions: [ '*' ] }
		],

		defaultPath: fullPath
	};

	dialog.showSaveDialog( mainWindow, options ).then( ( n ) => {
		if ( n.canceled ) {
			return;
		} else {
			var filepath = n.filePath;
			
			var pathname = path.dirname( filepath );
			
			change_working_directory( pathname );
			
			if ( path.extname( filepath ) === "" ) {
				filepath += ".md";
			}
			
			filename = path.basename( filepath );
			
			mainWindow.webContents.send( "saved-file", pathname, filename );
			
			return;
		}
	} );
}

function export_plain_html() {
	if ( filename ) {
		if ( exportname ) {
			mainWindow.webContents.send( "exported-file"/*, export_directory, exportname*/, false );
			
			return;
		} else {
			var extname = path.extname( filename );
			
			var fullPath;
			
			if ( extname === "" ) {
				fullPath = path.join( working_directory, path.basename( filename ) );
			} else {
				fullPath = path.join( working_directory, path.basename( filename, extname ) );
			}
			
			fullPath += ".html";

			var options = {
				filters: [
					{ name: "Html Files", extensions: [ "htm", "html" ] },
					{ name: "All Files", extensions: [ "*" ] }
				],

				defaultPath: fullPath
			};

			dialog.showSaveDialog( mainWindow, options ).then( ( n ) => {
				if ( n.canceled ) {
					return;
				} else {
					var filepath = n.filePath;
					
					var pathname = path.dirname( filepath );
					
					export_directory = pathname;
					
					if ( path.extname( filepath ) === "" ) {
						filepath += ".html";
					}
					
					exportname = path.basename( filepath );
					
					mainWindow.webContents.send( "exported-file"/*, pathname, exportname*/, false );
					
					return;
				}
			} );
		}
	} else {
		return;
	}
}

function export_( result, withcss ) {
	var fullpath;
	
	fullpath = path.join( export_directory, exportname );
	
	var content;
	
	if ( withcss ) {
		content = `<!DOCTYPE html>
<html lang="en">
<head>
<title> </title>
<!--
-->
<meta charset="utf-8">
<style type="text/css">
<!--
    
-->

html { font-size: 100%; overflow-y: scroll; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

body {
    color: #444;
    <!--
    font-family: Georgia, Palatino, 'Palatino Linotype', Times, 'Times New Roman', serif;
    font-size: 13px;
    -->
    font-family: 'Noto Sans Mono CJK TC', Palatino, 'Palatino Linotype', Times, 'Times New Roman', serif;
    font-size: 16px;
    line-height: 1.5em;
    padding: 1em;
    margin: auto;
    max-width: 42em;
    background: #fefefe;
}

h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
}

h1 {
    color: #000000;
    font-size: 28px;
}

h2 {
    border-bottom: 2px solid #CCCCCC;
    color: #000000;
    font-size: 24px;
}

h3 {
    border-bottom: 2px solid #CCCCCC;
    font-size: 18px;
}

h4 {
    font-size: 16px;
}

h5 {
    font-size: 14px;
}

h6 {
    color: #777777;
    background-color: inherit;
    font-size: 14px;
}

hr {
    height: 0.2em;
    border: 0;
    color: #CCCCCC;
    background-color: #CCCCCC;
}

p, blockquote, ul, ol, dl, li, table, pre {
    margin: 15px 0;
}

p {
    margin: 1em 0;
}

pre {
    background-color: #F8F8F8;
    border: 1px solid #CCCCCC;
    border-radius: 3px;
    overflow: auto;
    padding: 5px;
}

pre code {
    background-color: #F8F8F8;
    border: none;
    padding: 0;
}

code {
    <!--
    font-family: Consolas, Monaco, Andale Mono, monospace;
    -->
    font-family: Noto Sans Mono CJK TC, Monaco, Andale Mono, monospace;
    background-color: #F8F8F8;
    border: 1px solid #CCCCCC;
    border-radius: 3px;
    padding: 0 0.2em;
    line-height: 1;
}

pre > code {
    border: 0;
    margin: 0;
    padding: 0;
}


a { color: #0645ad; text-decoration: none; }
a:visited { color: #0b0080; }
a:hover { color: #06e; }
a:active { color: #faa700; }
a:focus { outline: thin dotted; }
a:hover, a:active { outline: 0; }

::-moz-selection { background: rgba(255, 255, 0, 0.3); color: #000 }
::selection { background: rgba(255, 255, 0, 0.3); color: #000 }

a::-moz-selection { background: rgba(255, 255,0, 0.3); color: #0645ad }
a::selection { background: rgba(255, 255, 0, 0.3); color: #0645ad }

blockquote {
    color: #666666;
    margin: 0;
    padding-left: 3em;
    border-left: 0.5em #EEE solid;
}

ul, ol { margin: 1em 0; padding: 0 0 0 2em; }
li p:last-child { margin: 0 }
dd { margin: 0 0 0 2em; }

img { border: 0; -ms-interpolation-mode: bicubic; vertical-align: middle; max-width: 100%; }

table { border-collapse: collapse; border-spacing: 0; }
td { vertical-align: top; }

@media only screen and (min-width: 480px) {
    body { font-size: 14px; }
}

@media only screen and (min-width: 768px) {
    body { font-size: 16px; }
}
</style>
</head>
<body style="font-family: 'Noto Sans Mono CJK TC', NSimSun, Serif; font-size: 18px;">
`;
	} else {
		content = `<!DOCTYPE html>
<html lang="en">
<head>
<title> </title>
<!---->
<meta charset="utf-8">
<!--
-->
</head>
<body style="font-family: 'Noto Sans Mono CJK TC', 'Noto Sans Mono CJK TC', Serif; font-size: 18px;">
`;
	}
	
	content += result;
	
	content += `
</body>
</html>`;
	
	fs.writeFile( fullpath, content, ( err ) => {
		if ( err ) throw err;
		
		const options = {
			type: "info",
			buttons: [ "OK", "Cancel" ],
			defaultId: 0,
			title: "Completed",
			message: "Successfully Exported\n\n" + fullpath + "\n\nOpen Right Now?",
			noLink: true
		};

		var result = dialog.showMessageBoxSync( mainWindow, options );
		
		if ( result === 0 ) {
			openExternal( fullpath );
		}
	} );
}

async function openExternal( urlstr ) {
	const { shell } = require( "electron" );
	
	await shell.openExternal( urlstr );
}

function export_html() {
	if ( filename ) {
		var pathName, fullPath;

		if ( export_directory.length > 0 ) {
			pathName = export_directory;
		} else {
			pathName = working_directory;
		}

		if ( exportname ) {
			fullPath = path.join( pathName, exportname );
		} else {
			var extname = path.extname( filename );
			
			if ( extname === "" ) {
				fullPath = path.join( pathName, path.basename( filename ) );
			} else {
				fullPath = path.join( pathName, path.basename( filename, extname ) );
			}
			
			fullPath += ".html";
		}
		
		var options = {
			filters: [
				{ name: "Html Files", extensions: [ "htm", "html" ] },
				{ name: 'All Files', extensions: [ '*' ] }
			],

			defaultPath: fullPath
		};

		dialog.showSaveDialog( mainWindow, options ).then( ( n ) => {
			if ( n.canceled ) {
				return;
			} else {
				var filepath = n.filePath;
				
				var pathname = path.dirname( filepath );
				
				export_directory = pathname;
				
				if ( path.extname( filepath ) === "" ) {
					filepath += ".html";
				}
				
				exportname = path.basename( filepath );
				
				mainWindow.webContents.send( "exported-file"/*, pathname, exportname*/, true );
				
				return;
			}
		} );
	} else {
		return;
	}
}

function change_working_directory( new_path ) {
	working_directory = new_path;

}

/*
function toggleScreen() {
	if ( mainWindow.isFullScreen() === true ) {
		mainWindow.setFullScreen( false );
		mainWindow.setMenuBarVisibility( false );
	} else {
		mainWindow.setFullScreen( true );
	}
	
	mainWindow.webContents.send( 'toggleScreen-change' );
}

*/
function get( event, arg ) {
	var options;
	
	if ( arg === "file" ) {
		options = {
			properties: [ "openFile" ],
			defaultPath: working_directory
		};
	}
	
	if ( arg === "image" ) {
		options = {
			properties: [ "openFile" ],
			filters: [
				{ name: "images", extensions: [ "jpg", "png", "gif", "svg" ] }
			],
			defaultPath: working_directory
		};
	}
	
	dialog.showOpenDialog( mainWindow, options ).then( ( fn ) => {
		var return_value;
		
		//  Prevent error message if click cancel
		if ( fn.canceled ) {
			return_value = {
				filePath: "",
				pathName: ""
			};
		} else {
			var path_name = fn.filePaths[ 0 ];
			
			if ( working_directory.length > 0 ) {
				if ( path_name.toUpperCase().startsWith( ( working_directory + "\\" ).toUpperCase() ) ) {
					return_value = {
						filePath: working_directory,
						pathName: path_name
					};
				} else {
					return_value = {
						filePath: "",
						pathName: ""
					};
					
					dialog.showMessageBox( mainWindow, {
						type: "info",

						detail: "file should in" + " " + "\"" + working_directory + "\"" + " " + "or its sub Directory" + "."
					} );
				}
			} else {
				return_value = {
					filePath: path.dirname( path_name ),
					pathName: path_name
				};
			}
		}
		
		event.returnValue = return_value;
	} );
}

function update_title( new_title ) {
	mainWindow.setTitle( new_title );
}

function electron_alert( arg ) {
	dialog.showMessageBox( mainWindow, {
		type: "info",
		detail: arg
	} );
}

function electron_confirm( event, arg ) {
	const options = {
		type: "info",
		buttons: [ "OK", "Cancel" ],
		defaultId: 0,
		title: "CKEditor Electron",
		message: arg,
		noLink: true
	};

	var result = dialog.showMessageBoxSync( mainWindow, options );
	
	event.returnValue = result;
}

function addPicture() {
	prompt( {
		/*
		title: 'Prompt example',
		*/
		label: 'URL:',
		/*
		value: 'https://example.org',
		*/
		inputAttrs: {
			type: 'text', required: true
		},
		height: 180,
		type: 'input'
	}, mainWindow )
	.then( ( r ) => {
		if ( r ) {
			/*
			console.log( 'result', r );
			
			*/
			mainWindow.webContents.send( 'addPicture', r.trim() );
		} else {
			/*
			console.log( 'user cancelled' );
			*/
		}
	} )
	.catch( console.error );
}

function addLink() {
	prompt( {
		/*
		title: 'Prompt example',
		*/
		label: 'URL:',
		/*
		value: 'https://example.org',
		*/
		inputAttrs: {
			type: 'text', required: true
		},
		height: 180,
		type: 'input'
	}, mainWindow )
	.then( ( r ) => {
		if ( r ) {
			/*
			console.log( 'result', r );
			
			*/
			mainWindow.webContents.send( 'addLink', r.trim() );
		} else {
			
		}
	} )
	.catch( console.error );
}
