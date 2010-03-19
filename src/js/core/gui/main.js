/*
 * Scriptographer
 *
 * This file is part of Scriptographer, a Plugin for Adobe Illustrator.
 *
 * Copyright (c) 2002-2010 Juerg Lehni, http://www.scratchdisk.com.
 * All rights reserved.
 *
 * Please visit http://scriptographer.org/ for updates and contact.
 *
 * -- GPL LICENSE NOTICE --
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * -- GPL LICENSE NOTICE --
 *
 * $Id$
 */

// Tool

var tool = new Tool('Scriptographer Tool', getImage('tool.png')) {
	activeImage: getImage('tool-active.png'),
	tooltip: 'Execute a tool script to assign it with this tool button'
};

var mainDialog = new FloatingDialog('tabbed show-cycle resizing remember-placing', function() {

	// Script List

	scriptList = new HierarchyList(this) {
		style: 'black-rect',
		size: [208, 20 * lineHeight],
		minimumSize: [208, 8 * lineHeight],
		entryTextRect: [0, 0, 2000, lineHeight],
		directory: scriptographer.scriptDirectory,
		// TODO: consider adding onDoubleClick and onExpand / Collapse, instead of this 
		// workaround here. Avoid onTrack as much as possible in scripts,
		// and add what's needed behind the scenes.
		onTrackEntry: function(tracker, entry) {
			// Detect expansion of unpopulated folders and populate on the fly
			var expanded = entry.expanded;
			entry.defaultTrack(tracker); // this might change entry.expanded state
			if (!entry.populated && !expanded && entry.expanded)
				entry.populate();
			// Detect doubleclicks on files and folders.
			if (tracker.action == Tracker.ACTION_BUTTON_UP &&
					(tracker.modifiers & Tracker.MODIFIER_DOUBLE_CLICK) &&
					tracker.point.x > entry.expandArrowRect.right) {
				if (entry.isDirectory) {
					entry.expanded = !entry.expanded;
					entry.list.invalidate();
				} else {
					// Edit the file through app.launch
					// TODO: On windows, this launches the scripting host by default
					app.launch(entry.file);
					// execute();
				}
			}
			// Return false to prevent calling of defaultTrack sine we called it already.
			return false;
		}
	};

	var scriptImage = getImage('script.png');
	var toolScriptImage = getImage('script-tool.png');
	var activeToolScriptImage = getImage('script-tool-active.png');
	var folderImage = getImage('folder.png');

	var directoryEntries = {};
	var fileEntries = {};
	var currentToolFile = null;
	var myScriptsEntry = null;

	function addFile(list, file, index) {
		var entry = new HierarchyListEntry(list, Base.pick(index, -1)) {
			text: file.name,
			// backgroundColor: 'background',
			file: file,
			lastModified: file.lastModified,
			isDirectory: file.isDirectory()
		};
		var isRoot = list == scriptList;
		if (entry.isDirectory) {
			// Create empty child list to get the arrow button but do not
			// populate yet. This is done dynamically in onTrackEntry, when
			// the user opens the list
			entry.createChildList();
			entry.childList.directory = file;
			// Seal Examples and Tutorials and pass on sealed setting
			entry.childList.sealed = isRoot ? /^(Examples|Tutorials)$/.test(file.name) : list.sealed;
			if (isRoot && file.name == 'My Scripts')
				myScriptsEntry = entry;
			entry.expanded = false;
			entry.populated = false;
			entry.populate = function() {
				if (!this.populated) {
					this.childList.directory = file;
					var files = getFiles(this.childList);
					for (var i = 0; i < files.length; i++)
						addFile(this.childList, files[i]);
					this.populated = true;
				}
			}
			entry.image = folderImage;
			directoryEntries[file] = entry;
		} else {
			entry.update = function() {
				var type = file.readAll().match(/(onMouse(?:Up|Down|Move|Drag))/);
				this.type = type && (type[1] && 'tool');
				this.image = this.type == 'tool'
					? (currentToolFile == this.file
						? activeToolScriptImage
						: toolScriptImage)
					: scriptImage;
			}
			entry.update();
			fileEntries[file] = entry;
		}
		return entry;
	}

	function getFiles(list) {
		if (!list.directory)
			return [];
		var files = list.directory.list(function(file) {
			return !/^__|^\.|^libraries$|^CVS$/.test(file.name) && 
				(/\.(?:js|rb|py)$/.test(file.name) || file.isDirectory());
		});
		if (list == scriptList) {
			var order = {
				'Examples': 1,
				'Tutorials': 2,
				'My Scripts': 3
			};
			files.sort(function(file1, file2) {
				var pos1 = order[file1.name] || 4;
				var pos2 = order[file2.name] || 4;
				return pos1 < pos2
					? -1 
					: pos1 > pos2
						? 1
						: 0;
			});
		}
		return files;
	}

	function refreshList(list) {
		if (!list) {
			scriptList.directory = scriptographer.scriptDirectory;
			list = scriptList;
		}
		// Do only refresh populated lists
		if (list.parentEntry && !list.parentEntry.populated)
			return null;
		// Get new listing of the directory, then match with already inserted files.
		// Create a lookup object for easily finding and tracking of already inserted files.	
		var files = getFiles(list).each(function(file, i) {
			this[file.path] = {
				file: file,
				index: i,
			};
		}, {});
		// Now walk through all the already inserted files, find the ones that
		// need to be removed, and refresh already populated ones.
		var removed = list.each(function(entry) {
			if (!files[entry.file.path]) {
				// Don't remove right away since that would mess up the each loop.
				// Instead. we collect them in the removed array, to be removed
				// in a seperate loop after.
				this.push(entry);
			} else {
				delete files[entry.file.path];
				// See if the file was changed, and if so, update its icon since
				// it might be a tool now
				var lastModified = entry.file.lastModified;
				if (entry.lastModified != lastModified) {
					entry.lastModified = lastModified; 
					if (!entry.isDirectory)
						entry.update();
				}
				if (entry.populated)
					refreshList(entry.childList);
			}
		}, []);
		// Remove the deleted files.
		removed.each(function(entry) {
			entry.remove();
		});
		// Files now only contains new files that are not inserted yet.
		// Look through them and insert in the right paces.
		var added = files.each(function(info) {
			this.push(addFile(list, info.file, info.index));
		}, []);
		return {
			removed: removed,
			added: added
		}
	}

	function createFile() {
		var entry = scriptList.activeLeaf;
		var list = entry && (entry.isDirectory ? entry.childList : entry.list);
		if (!list || list.sealed)
			list = myScriptsEntry ? myScriptsEntry.childList : scriptList;
		var dir = list.directory;
		if (dir) {
			// Find a non existing filename:
			var file;
			for (var i = 1; ; i++) {
				file = new File(dir, 'Untitled ' + i + '.js');
				if (!file.exists())
					break;
			}
			file = Dialog.fileSave('Create a New Script:', [
				'JavaScript Files (*.js)', '*.js',
				'All Files', '*.*'
			], file);
			   // Add it to the list as well:
			if (file && file.createNewFile()) {
				// Use refreshList to make sure the new item appears in the
				// right place, and mark the newly added file as selected.
				var res = refreshList(list);
				if (res) {
					res.added.each(function(newEntry) {
						if (newEntry.file == file) {
							if (entry)
								entry.selected = false;
							newEntry.selected = true;
						}
					});
				}
			}
		}
	}

	function getSelectedScriptEntry() {
		var entry = scriptList.activeLeaf;
		return entry && entry.file ? entry : null;
	}

	function compileScope(entry, handler) {
		var scr = ScriptographerEngine.compile(entry.file);
		if (scr) {
			var scope = entry.scope = scr.engine.createScope();
			if (handler instanceof ToolEventHandler)
				scope.put('tool', handler, true);
			// Don't call scr.execute directly, since we handle SG
			// specific things in ScriptographerEngine.execute:
			ScriptographerEngine.execute(scr, entry.file, scope);
			// Now copy over handlers from the scope and set them on the tool,
			// to allow them to be defined globally.
			var names = entry.type == 'tool'
				? ['onOptions', 'onSelect', 'onDeselect', 'onReselect',
					'onMouseDown', 'onMouseUp', 'onMouseDrag', 'onMouseMove']
				: ['onEditParameters', 'onCalculate', 'onGetInputType'];
			names.each(function(name) {
				var func = scope.getCallable(name);
				if (func)
					handler[name] = func;
			});
			return scope;
		}
	}

	function execute() {
		var entry = getSelectedScriptEntry();
		if (entry) {
			switch (entry.type) {
			case 'tool':
				// Manually call onStop in tool scopes before they get overridden.
				if (entry.scope) {
					var onStop = entry.scope.getCallable('onStop');
					if (onStop)
						onStop.call(tool);
				}
				tool.title = tool.tooltip = entry.file.name;
				tool.image = tool.activeImage;
				// Reset settings
				tool.initialize();
				var scope = compileScope(entry, tool);
				if (scope) {
					// Call onInit on the tool scope, for backward compatibility.
					var onInit = scope.getCallable('onInit');
					if (onInit)
						onInit.call(tool);
				}
				if (entry.file != currentToolFile) {
					var curEntry = fileEntries[currentToolFile];
					if (curEntry && curEntry.isValid())
						curEntry.image = toolScriptImage;
					entry.image = activeToolScriptImage;
					currentToolFile = entry.file;
				}
				break;
			default:
				ScriptographerEngine.execute(entry.file, null);
			}
		}
	}

	// Script Directory Stuff

	function chooseScriptDirectory(dir) {
		dir = Dialog.chooseDirectory(
			'Please choose the Scriptographer script directory',
			dir || scriptographer.scriptDirectory || scriptographer.pluginDirectory);
		if (dir && dir.isDirectory()) {
			script.preferences.scriptDirectory = dir.path;
			setScriptDirectory(dir);
			return true;
		}
	}

	function setScriptDirectory(dir) {
		// Tell Scriptographer about where to look for scripts.
		ScriptographerEngine.scriptDirectory = dir;
		// Load librarires:
		// TODO: Is this still used?
		ScriptographerEngine.loadLibraries(new File(dir, 'Libraries'));
		refreshList();
	}

	// Read the script directory first, or ask for it if its not defined:
	var dir = script.preferences.scriptDirectory;
	// If no script directory is defined, try the default place for Scripts:
	// The subdirectory 'scripts' in the plugin directory:
	dir = dir
		? new File(dir)
		: new File(scriptographer.pluginDirectory, 'Scripts');
	if (!dir.exists() || !dir.isDirectory()) {
		if (!chooseScriptDirectory(dir))
			Dialog.alert('Could not find Scriptographer script directory.');
	} else {
		setScriptDirectory(dir);
	}

	// Menus

	var scriptographerGroup = new MenuGroup(MenuGroup.GROUP_TOOL_PALETTES,
			MenuGroup.OPTION_ADD_ABOVE | MenuGroup.OPTION_SEPARATOR_ABOVE);

	var scriptographerItem = new MenuItem(scriptographerGroup) {
		text: 'Scriptographer'
	};

// 	var separator = new MenuGroup(scriptographerGroup, MenuGroup.OPTION_ADD_ABOVE);

	new MenuItem(scriptographerItem) {
		onSelect: function() {
			mainDialog.visible = !mainDialog.visible;
		},
		onUpdate: function() {
			this.text = (mainDialog.visible ? 'Hide' : 'Show') + ' Main Palette';
		}
	}.setCommand('M', MenuItem.MODIFIER_SHIFT | MenuItem.MODIFIER_COMMAND);

	new MenuItem(scriptographerItem) {
		onSelect: function() {
			consoleDialog.visible = !consoleDialog.visible;
		},
		onUpdate: function() {
			this.text = (consoleDialog.visible ? 'Hide' : 'Show') + ' Console Palette';
		}
	}.setCommand('C', MenuItem.MODIFIER_SHIFT | MenuItem.MODIFIER_COMMAND);

	new MenuItem(scriptographerItem) {
		text: 'About...',
		onSelect: function() {
			aboutDialog.doModal();
		}
	};

	new MenuItem(scriptographerItem) {
		separator: true
	};

	new MenuItem(scriptographerItem) {
		text: 'Reload',
		onSelect: function() {
			ScriptographerEngine.reload();
		}
	};

	// Popup Menu

	var menu = this.popupMenu;

	var executeEntry = new ListEntry(menu) {
		text: 'Execute Script',
		onSelect: function() {
			execute();
		}
	};

	var consoleEntry = new ListEntry(menu) {
		text: 'Show / Hide Console',
		onSelect: function() {
			consoleDialog.visible = !consoleDialog.visible;
		},
		onUpdate: function() {
			// TODO: Make onUpdate work in ListEntry
			this.text = (consoleDialog.visible ? 'Hide' : 'Show') + ' Console Palette';
		}
	};

	var scriptDirEntry = new ListEntry(menu) {
		text: 'Set Script Directory...',
		onSelect: chooseScriptDirectory
	};

	var aboutEntry = new ListEntry(menu) {
		text: 'About Scriptographer...',
		onSelect: function() {
			aboutDialog.doModal();
		}
	};

	var referenceEntry = new ListEntry(menu) {
		text: 'Reference...',
		onSelect: function() {
			app.launch('file://' + new File(scriptographer.pluginDirectory, 'Reference/index.html'));
		}
	};

	var separatorEntry = new ListEntry(menu) {
		separator: true
	};

	var reloadEntry = new ListEntry(menu) {
		text: 'Reload',
		onSelect: function() {
			ScriptographerEngine.reload.delay(1);
		}
	};

	// Event Handlers

	global.onActivate = function() {
		refreshList();
	}

	global.onKeyDown = function(event) {
		if (event.character == '`' && !event.modifiers.command && !event.modifiers.shift) {
			tool.selected = true;
			return true;
		}
	}

	// Buttons:
	var playButton = new ImageButton(this) {
		image: getImage('play.png'),
		size: buttonSize,
		onClick: function() {
			execute();
		}
	};

	var stopButton = new ImageButton(this) {
		image: getImage('stop.png'),
		size: buttonSize,
		onClick: function() {
			ScriptographerEngine.stopAll();
		}
	};

	var consoleButton = new ImageButton(this) {
		image: getImage('console.png'),
		size: buttonSize,
		onClick: function() {
			consoleDialog.visible = !consoleDialog.visible;
		}
	};

	var newButton = new ImageButton(this) {
		image: getImage('script.png'),
		size: buttonSize,
		onClick: function() {
			createFile();
		}
	};

	return {
		title: 'Scriptographer',
		margin: [0, -1, -1, -1],
		content: {
			center: scriptList,
			south: new ItemGroup(this) {
				layout: [ 'left', -1, -1 ],
				content: [
					playButton,
					stopButton,
					new Spacer(4, 0),
					newButton,
					consoleButton,
				]
			}
		}
	};
});

// Force mainDialog to show if this is the first run of Scriptographer
if (firstRun) {
	(function() {
		mainDialog.visible = true;
	}).delay(0);
}
