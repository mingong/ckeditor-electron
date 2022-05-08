const { Menu, BrowserWindow } = require( "electron" );

let template = [
	{
		label: "&File",
		submenu: [
			{
				label: "Set Working Directory",
				/*
				accelerator: "CmdOrCtrl+Shift+O",
				*/
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "electronAction", "call-set" );
				}
			},
			/*
			{
				label: "Tes Working Directory",
				
				accelerator: "CmdOrCtrl+Shift+O",
				
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "electronAction", "call-tes" );
				}
			},
			*/
			{
				label: "New",
				accelerator: "CmdOrCtrl+N",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "action", "call-new" );
				}
			}, {
				label: "Open",
				accelerator: "CmdOrCtrl+O",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "action", "call-open" );
				}
			}, {
				label: "Save",
				accelerator: "CmdOrCtrl+S",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "action", "call-save" );
				}
			}, {
				label: "Save As",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "action", "call-saveAs" );
				}
			}, { type: "separator" }, {
				role: "quit"
			}
		]
	}, {
		label: "&Edit",
		submenu: [
			{
				/*
				role: "undo"
				*/
				label: "Undo",
				accelerator: "CmdOrCtrl+Z",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "ckeditorAction", "undo" );
				}
			}, {
				/*
				role: "redo"
				*/
				label: "Redo",
				accelerator: "CmdOrCtrl+Y",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "ckeditorAction", "redo" );
				}
			}, { type: "separator" }, {
				role: "cut"
			}, {
				role: "copy"
			}, {
				role: "paste"
			}, {
				role: "delete",
				accelerator: "Delete",
			}, { type: "separator" }, {
				role: "selectAll"
			}
		]
	}, {
		label: "&View",
		submenu: [
			{
				label: "Developer Tools",
				accelerator: "CmdOrCtrl+Shift+I",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.openDevTools( { mode: "detach" } );
				}
			}, { type: "separator" }, {
				/*
				label: "Toggle Full Screen",
				accelerator: "F11",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "electronAction", "toggleScreen" );
				}
				*/
				role: "togglefullscreen"
			}
        ]
	}, {
		label: "&Window",
		submenu: [
			{
				role: "minimize"
			}, {
				role: "close"
			}
        ]
	}, {
		label: "For&mat",
		submenu: [
			{
				label: "Strikethrough",
				accelerator: "CmdOrCtrl+T",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "ckeditorAction", "strikethrough" );
				}
			}, {
				label: "Code",
				accelerator: "CmdOrCtrl+P",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "ckeditorAction", "code" );
				}
			}, {
				label: "RemoveFormat",
				accelerator: "CmdOrCtrl+R",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "ckeditorAction", "removeFormat" );
				}
			}
		]
	}, {
		label: "&Tools",
		submenu: [
			{
				label: "TodoList",
				accelerator: "CmdOrCtrl+L",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "ckeditorAction", "todoList" );
				}
			}, { type: "separator" }, {
				label: "Noto Sans Mono CJK TC",
				click: async () => {
					const { shell } = require( "electron" );
					
					await shell.openExternal( "https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/Mono/NotoSansMonoCJKtc-Regular.otf" );
				}
			}
		]
	}, {
		label: "E&xport",
		submenu: [
			{
				label: "Plain Html",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "action", "export-plainHtml" );
				}
			}, /*{ type: "separator" }, */{
				label: "Html",
				click: () => {
					BrowserWindow.getFocusedWindow().webContents.send( "action", "export-html" );
				}
			}
		]
	}
];

const menu = Menu.buildFromTemplate( template );

Menu.setApplicationMenu(menu);
