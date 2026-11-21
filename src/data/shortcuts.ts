// Keyboard shortcut reference data.
// Notation: keys joined with "+", sequential chords separated by ", " (e.g. "Ctrl+K, Z").
// `win` = Windows (and Linux/ChromeOS where identical), `mac` = macOS. Only shortcuts we are confident
// about are listed; when one platform's shortcut is uncertain or does not exist, it is omitted.

export type ShortcutApp = 'windows' | 'macos' | 'vscode' | 'excel' | 'sheets';
export type Platform = 'win' | 'mac';

export interface Shortcut {
  id: string;
  app: ShortcutApp;
  action: string;
  explanation: string;
  win?: string;
  mac?: string;
}

export const APPS: Record<ShortcutApp, { name: string; platforms: Platform[] }> = {
  windows: { name: 'Windows', platforms: ['win'] },
  macos: { name: 'macOS', platforms: ['mac'] },
  vscode: { name: 'VS Code', platforms: ['win', 'mac'] },
  excel: { name: 'Microsoft Excel', platforms: ['win', 'mac'] },
  sheets: { name: 'Google Sheets', platforms: ['win', 'mac'] },
};

export const PLATFORM_NAME: Record<Platform, string> = { win: 'Windows', mac: 'macOS' };

export const SHORTCUTS: Shortcut[] = [
  // ---------------- Windows ----------------
  { id: 'w-desktop', app: 'windows', action: 'Show or hide the desktop', win: 'Win+D', explanation: 'Minimises every window to reveal the desktop; press again to restore them.' },
  { id: 'w-explorer', app: 'windows', action: 'Open File Explorer', win: 'Win+E', explanation: 'Opens a new File Explorer window.' },
  { id: 'w-lock', app: 'windows', action: 'Lock your PC', win: 'Win+L', explanation: 'Locks the computer immediately — useful whenever you step away.' },
  { id: 'w-settings', app: 'windows', action: 'Open Settings', win: 'Win+I', explanation: 'Opens the Windows Settings app.' },
  { id: 'w-run', app: 'windows', action: 'Open the Run dialog', win: 'Win+R', explanation: 'Opens Run, where you can type a program or command name to launch it.' },
  { id: 'w-clip', app: 'windows', action: 'Open clipboard history', win: 'Win+V', explanation: 'Shows items you copied recently (clipboard history must be turned on).' },
  { id: 'w-snip', app: 'windows', action: 'Take a screenshot of part of the screen', win: 'Win+Shift+S', explanation: 'Opens the screen snipping tool so you can capture a region, window or the full screen.' },
  { id: 'w-alttab', app: 'windows', action: 'Switch between open apps', win: 'Alt+Tab', explanation: 'Hold Alt and tap Tab to cycle through open windows.' },
  { id: 'w-close', app: 'windows', action: 'Close the active window or app', win: 'Alt+F4', explanation: 'Closes the current window. On the desktop it opens the shut-down dialog.' },
  { id: 'w-task', app: 'windows', action: 'Open Task Manager directly', win: 'Ctrl+Shift+Esc', explanation: 'Opens Task Manager without going through the Ctrl+Alt+Delete screen.' },
  { id: 'w-taskview', app: 'windows', action: 'Open Task View', win: 'Win+Tab', explanation: 'Shows all open windows and your virtual desktops.' },
  { id: 'w-emoji', app: 'windows', action: 'Open the emoji panel', win: 'Win+.', explanation: 'Opens the emoji, symbol and GIF picker in any text field.' },
  { id: 'w-snapleft', app: 'windows', action: 'Snap the window to the left half of the screen', win: 'Win+Left', explanation: 'Snaps the active window to the left; Win+Right snaps it to the right.' },
  { id: 'w-max', app: 'windows', action: 'Maximise the active window', win: 'Win+Up', explanation: 'Maximises the current window; Win+Down restores or minimises it.' },
  { id: 'w-newdesk', app: 'windows', action: 'Create a new virtual desktop', win: 'Win+Ctrl+D', explanation: 'Adds a virtual desktop and switches to it.' },
  { id: 'w-switchdesk', app: 'windows', action: 'Switch to the next virtual desktop on the right', win: 'Win+Ctrl+Right', explanation: 'Moves between virtual desktops; use Left for the previous one.' },
  { id: 'w-minall', app: 'windows', action: 'Minimise all windows', win: 'Win+M', explanation: 'Minimises all windows (Win+Shift+M restores them).' },
  { id: 'w-project', app: 'windows', action: 'Choose a display / projection mode', win: 'Win+P', explanation: 'Switches between PC screen only, duplicate, extend and second screen only.' },
  { id: 'w-rename', app: 'windows', action: 'Rename the selected file in File Explorer', win: 'F2', explanation: 'Makes the selected item’s name editable.' },
  { id: 'w-newfolder', app: 'windows', action: 'Create a new folder in File Explorer', win: 'Ctrl+Shift+N', explanation: 'Creates a new folder in the current File Explorer location.' },
  { id: 'w-search', app: 'windows', action: 'Open Windows search', win: 'Win+S', explanation: 'Opens search for apps, files and settings.' },

  // ---------------- macOS ----------------
  { id: 'm-spot', app: 'macos', action: 'Open Spotlight search', mac: 'Cmd+Space', explanation: 'Searches apps, files, settings and more. Start typing an app name and press Return to open it.' },
  { id: 'm-apps', app: 'macos', action: 'Switch between open apps', mac: 'Cmd+Tab', explanation: 'Hold Command and tap Tab to cycle through running apps.' },
  { id: 'm-quit', app: 'macos', action: 'Quit the current app', mac: 'Cmd+Q', explanation: 'Fully quits the frontmost app (closing its windows alone usually leaves it running).' },
  { id: 'm-closewin', app: 'macos', action: 'Close the front window', mac: 'Cmd+W', explanation: 'Closes the active window or tab without quitting the app.' },
  { id: 'm-hide', app: 'macos', action: 'Hide the current app', mac: 'Cmd+H', explanation: 'Hides all windows of the frontmost app.' },
  { id: 'm-min', app: 'macos', action: 'Minimise the front window to the Dock', mac: 'Cmd+M', explanation: 'Sends the active window to the Dock.' },
  { id: 'm-shot3', app: 'macos', action: 'Screenshot the entire screen', mac: 'Cmd+Shift+3', explanation: 'Captures the whole screen and saves it to the desktop by default.' },
  { id: 'm-shot4', app: 'macos', action: 'Screenshot a selected area', mac: 'Cmd+Shift+4', explanation: 'Turns the pointer into a crosshair so you can drag to capture part of the screen.' },
  { id: 'm-shot5', app: 'macos', action: 'Open the Screenshot toolbar (with screen recording)', mac: 'Cmd+Shift+5', explanation: 'Shows controls for screenshots and screen recordings.' },
  { id: 'm-force', app: 'macos', action: 'Open the Force Quit Applications window', mac: 'Cmd+Option+Esc', explanation: 'Lets you force-quit an app that has stopped responding.' },
  { id: 'm-lock', app: 'macos', action: 'Lock the screen', mac: 'Ctrl+Cmd+Q', explanation: 'Immediately locks your Mac and shows the login window.' },
  { id: 'm-prefs', app: 'macos', action: 'Open the current app’s settings', mac: 'Cmd+,', explanation: 'Opens Settings (Preferences) for the frontmost app in most Mac apps.' },
  { id: 'm-hidden', app: 'macos', action: 'Show or hide hidden files in Finder', mac: 'Cmd+Shift+.', explanation: 'Toggles the visibility of hidden files in Finder windows and file dialogs.' },
  { id: 'm-trash', app: 'macos', action: 'Move the selected item to the Bin (Trash) in Finder', mac: 'Cmd+Delete', explanation: 'Moves selected Finder items to the Bin.' },
  { id: 'm-emoji', app: 'macos', action: 'Open Emoji & Symbols', mac: 'Ctrl+Cmd+Space', explanation: 'Opens the character viewer for emoji and special symbols.' },
  { id: 'm-samewin', app: 'macos', action: 'Switch between windows of the same app', mac: 'Cmd+`', explanation: 'Cycles through the open windows of the frontmost app.' },
  { id: 'm-mission', app: 'macos', action: 'Open Mission Control', mac: 'Ctrl+Up', explanation: 'Shows all open windows and desktop spaces.' },
  { id: 'm-goto', app: 'macos', action: 'Go to a folder by typing its path in Finder', mac: 'Cmd+Shift+G', explanation: 'Opens the Go to Folder box in Finder.' },
  { id: 'm-info', app: 'macos', action: 'Get Info for the selected file in Finder', mac: 'Cmd+I', explanation: 'Shows size, location, permissions and other details.' },
  { id: 'm-newfolder', app: 'macos', action: 'Create a new folder in Finder', mac: 'Cmd+Shift+N', explanation: 'Creates a new folder in the current Finder window.' },
  { id: 'm-dock', app: 'macos', action: 'Turn Dock hiding on or off', mac: 'Cmd+Option+D', explanation: 'Toggles automatic hiding of the Dock.' },

  // ---------------- VS Code ----------------
  { id: 'v-palette', app: 'vscode', action: 'Open the Command Palette', win: 'Ctrl+Shift+P', mac: 'Cmd+Shift+P', explanation: 'Gives access to every command in VS Code by name.' },
  { id: 'v-quickopen', app: 'vscode', action: 'Quick Open a file by name', win: 'Ctrl+P', mac: 'Cmd+P', explanation: 'Type part of a file name to jump to it.' },
  { id: 'v-sidebar', app: 'vscode', action: 'Toggle the sidebar', win: 'Ctrl+B', mac: 'Cmd+B', explanation: 'Shows or hides the primary sidebar to give the editor more room.' },
  { id: 'v-terminal', app: 'vscode', action: 'Toggle the integrated terminal', win: 'Ctrl+`', mac: 'Ctrl+`', explanation: 'Shows or hides the terminal panel. This one uses Control on macOS too.' },
  { id: 'v-comment', app: 'vscode', action: 'Toggle line comment', win: 'Ctrl+/', mac: 'Cmd+/', explanation: 'Comments or uncomments the current line or selection.' },
  { id: 'v-gotoline', app: 'vscode', action: 'Go to a line number', win: 'Ctrl+G', mac: 'Ctrl+G', explanation: 'Jumps to a specific line. It uses Control on macOS as well.' },
  { id: 'v-nextmatch', app: 'vscode', action: 'Add the next occurrence of the selection to a multi-cursor', win: 'Ctrl+D', mac: 'Cmd+D', explanation: 'Each press selects the next match so you can edit them all at once.' },
  { id: 'v-allmatch', app: 'vscode', action: 'Select all occurrences of the current selection', win: 'Ctrl+Shift+L', mac: 'Cmd+Shift+L', explanation: 'Places a cursor on every match in the file.' },
  { id: 'v-moveline', app: 'vscode', action: 'Move the current line up', win: 'Alt+Up', mac: 'Option+Up', explanation: 'Moves the line (or selected lines) up; use Down to move it down.' },
  { id: 'v-copyline', app: 'vscode', action: 'Copy the current line down', win: 'Shift+Alt+Down', mac: 'Shift+Option+Down', explanation: 'Duplicates the line below the cursor.' },
  { id: 'v-deleteline', app: 'vscode', action: 'Delete the current line', win: 'Ctrl+Shift+K', mac: 'Cmd+Shift+K', explanation: 'Removes the whole line without selecting it first.' },
  { id: 'v-format', app: 'vscode', action: 'Format the document', win: 'Shift+Alt+F', mac: 'Shift+Option+F', explanation: 'Runs the configured formatter on the whole file.' },
  { id: 'v-def', app: 'vscode', action: 'Go to definition', win: 'F12', mac: 'F12', explanation: 'Jumps to where the symbol under the cursor is defined.' },
  { id: 'v-rename', app: 'vscode', action: 'Rename a symbol everywhere', win: 'F2', mac: 'F2', explanation: 'Renames a variable, function or class across the project.' },
  { id: 'v-findfiles', app: 'vscode', action: 'Search across all files', win: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F', explanation: 'Opens the Search view to find text in the whole workspace.' },
  { id: 'v-split', app: 'vscode', action: 'Split the editor', win: 'Ctrl+\\', mac: 'Cmd+\\', explanation: 'Opens the current file in a second editor group side by side.' },
  { id: 'v-zen', app: 'vscode', action: 'Toggle Zen Mode', win: 'Ctrl+K, Z', mac: 'Cmd+K, Z', explanation: 'A distraction-free full-screen editor. Press the first chord, release, then press Z.' },
  { id: 'v-settings', app: 'vscode', action: 'Open Settings', win: 'Ctrl+,', mac: 'Cmd+,', explanation: 'Opens the Settings editor.' },
  { id: 'v-ext', app: 'vscode', action: 'Show the Extensions view', win: 'Ctrl+Shift+X', mac: 'Cmd+Shift+X', explanation: 'Browse, install and manage extensions.' },
  { id: 'v-symbol', app: 'vscode', action: 'Go to a symbol in the current file', win: 'Ctrl+Shift+O', mac: 'Cmd+Shift+O', explanation: 'Lists functions, classes and other symbols in the file.' },
  { id: 'v-wrap', app: 'vscode', action: 'Toggle word wrap', win: 'Alt+Z', mac: 'Option+Z', explanation: 'Wraps long lines to fit the editor width.' },
  { id: 'v-newterm', app: 'vscode', action: 'Create a new terminal', win: 'Ctrl+Shift+`', mac: 'Ctrl+Shift+`', explanation: 'Opens an additional integrated terminal.' },

  // ---------------- Excel ----------------
  { id: 'x-autosum', app: 'excel', action: 'Insert an AutoSum formula', win: 'Alt+=', mac: 'Cmd+Shift+T', explanation: 'Adds a SUM formula for the cells above or to the left.' },
  { id: 'x-date', app: 'excel', action: 'Enter today’s date in the cell', win: 'Ctrl+;', mac: 'Ctrl+;', explanation: 'Inserts the current date as a fixed value (it will not update tomorrow).' },
  { id: 'x-filldown', app: 'excel', action: 'Fill down from the cell above', win: 'Ctrl+D', mac: 'Cmd+D', explanation: 'Copies the top cell of the selection into the cells below.' },
  { id: 'x-fillright', app: 'excel', action: 'Fill right from the cell to the left', win: 'Ctrl+R', mac: 'Cmd+R', explanation: 'Copies the leftmost cell of the selection into the cells to its right.' },
  { id: 'x-absolute', app: 'excel', action: 'Cycle a reference between relative and absolute ($A$1)', win: 'F4', mac: 'Cmd+T', explanation: 'While editing a formula, cycles A1 → $A$1 → A$1 → $A1.' },
  { id: 'x-newsheet', app: 'excel', action: 'Insert a new worksheet', win: 'Shift+F11', mac: 'Shift+F11', explanation: 'Adds a new sheet to the workbook.' },
  { id: 'x-col', app: 'excel', action: 'Select the entire column', win: 'Ctrl+Space', mac: 'Ctrl+Space', explanation: 'Selects the whole column of the active cell.' },
  { id: 'x-row', app: 'excel', action: 'Select the entire row', win: 'Shift+Space', mac: 'Shift+Space', explanation: 'Selects the whole row of the active cell.' },
  { id: 'x-format', app: 'excel', action: 'Open the Format Cells dialog', win: 'Ctrl+1', mac: 'Cmd+1', explanation: 'Number formats, alignment, borders and more in one dialog.' },
  { id: 'x-filter', app: 'excel', action: 'Turn filters on or off', win: 'Ctrl+Shift+L', mac: 'Cmd+Shift+F', explanation: 'Adds or removes filter drop-downs on the header row.' },
  { id: 'x-edge', app: 'excel', action: 'Jump to the edge of the current data region', win: 'Ctrl+Arrow', mac: 'Cmd+Arrow', explanation: 'Moves to the last filled cell in that direction — great for big sheets.' },
  { id: 'x-newline', app: 'excel', action: 'Start a new line inside the same cell', win: 'Alt+Enter', explanation: 'Inserts a line break within the cell instead of moving to the next cell.' },
  { id: 'x-formulas', app: 'excel', action: 'Show formulas instead of their results', win: 'Ctrl+`', explanation: 'Toggles formula view so you can audit a sheet.' },
  { id: 'x-edit', app: 'excel', action: 'Edit the active cell', win: 'F2', mac: 'Ctrl+U', explanation: 'Puts the cursor at the end of the cell’s contents for editing.' },
  { id: 'x-strike', app: 'excel', action: 'Apply or remove strikethrough', win: 'Ctrl+5', mac: 'Cmd+Shift+X', explanation: 'Draws a line through the text of the selected cells.' },
  { id: 'x-recalc', app: 'excel', action: 'Recalculate all workbooks', win: 'F9', explanation: 'Forces formulas to recalculate (useful in manual calculation mode).' },
  { id: 'x-insertfn', app: 'excel', action: 'Open the Insert Function dialog', win: 'Shift+F3', mac: 'Shift+F3', explanation: 'Helps you find a function and fill in its arguments.' },
  { id: 'x-hiderow', app: 'excel', action: 'Hide the selected rows', win: 'Ctrl+9', explanation: 'Hides rows without deleting them.' },

  // ---------------- Google Sheets ----------------
  { id: 's-link', app: 'sheets', action: 'Insert a link', win: 'Ctrl+K', mac: 'Cmd+K', explanation: 'Adds a hyperlink to the selected cell.' },
  { id: 's-comment', app: 'sheets', action: 'Insert a comment', win: 'Ctrl+Alt+M', mac: 'Cmd+Option+M', explanation: 'Adds a comment to the selected cell for collaborators.' },
  { id: 's-pastevalues', app: 'sheets', action: 'Paste values only (no formatting)', win: 'Ctrl+Shift+V', mac: 'Cmd+Shift+V', explanation: 'Pastes plain values without formulas or formatting.' },
  { id: 's-date', app: 'sheets', action: 'Insert the current date', win: 'Ctrl+;', mac: 'Cmd+;', explanation: 'Enters today’s date as a fixed value.' },
  { id: 's-time', app: 'sheets', action: 'Insert the current time', win: 'Ctrl+Shift+;', mac: 'Cmd+Shift+;', explanation: 'Enters the current time as a fixed value.' },
  { id: 's-filldown', app: 'sheets', action: 'Fill down', win: 'Ctrl+D', mac: 'Cmd+D', explanation: 'Copies the top cell of the selection downward.' },
  { id: 's-replace', app: 'sheets', action: 'Open Find and replace', win: 'Ctrl+H', mac: 'Cmd+Shift+H', explanation: 'Finds text and replaces it across the sheet or spreadsheet.' },
  { id: 's-strike', app: 'sheets', action: 'Apply strikethrough', win: 'Alt+Shift+5', mac: 'Cmd+Shift+X', explanation: 'Draws a line through the text in the selected cells.' },
  { id: 's-help', app: 'sheets', action: 'Show the list of keyboard shortcuts', win: 'Ctrl+/', mac: 'Cmd+/', explanation: 'Opens Google Sheets’ built-in shortcut reference.' },
  { id: 's-currency', app: 'sheets', action: 'Format as currency', win: 'Ctrl+Shift+4', mac: 'Cmd+Shift+4', explanation: 'Applies the currency number format.' },
  { id: 's-percent', app: 'sheets', action: 'Format as a percentage', win: 'Ctrl+Shift+5', mac: 'Cmd+Shift+5', explanation: 'Applies the percent number format.' },
  { id: 's-newsheet', app: 'sheets', action: 'Insert a new sheet', win: 'Shift+F11', mac: 'Shift+F11', explanation: 'Adds a new sheet tab.' },
  { id: 's-clearfmt', app: 'sheets', action: 'Clear formatting', win: 'Ctrl+\\', mac: 'Cmd+\\', explanation: 'Removes formatting from the selected cells but keeps their values.' },
  { id: 's-center', app: 'sheets', action: 'Centre-align the cell contents', win: 'Ctrl+Shift+E', mac: 'Cmd+Shift+E', explanation: 'Horizontally centres the contents of the selected cells.' },
  { id: 's-col', app: 'sheets', action: 'Select the entire column', win: 'Ctrl+Space', mac: 'Ctrl+Space', explanation: 'Selects the column of the active cell.' },
  { id: 's-row', app: 'sheets', action: 'Select the entire row', win: 'Shift+Space', mac: 'Shift+Space', explanation: 'Selects the row of the active cell.' },
  { id: 's-history', app: 'sheets', action: 'Open version history', win: 'Ctrl+Alt+Shift+H', mac: 'Cmd+Option+Shift+H', explanation: 'Shows earlier versions of the spreadsheet so you can review or restore them.' },
];

/** Splits "Ctrl+K, Z" into [["Ctrl","K"],["Z"]]. Handles a literal "+" key written as "++". */
export function parseCombo(combo: string): string[][] {
  return combo.split(', ').map((chord) => {
    const parts: string[] = [];
    let buf = '';
    for (let i = 0; i < chord.length; i++) {
      const ch = chord[i];
      if (ch === '+' && buf) {
        parts.push(buf);
        buf = '';
      } else buf += ch;
    }
    if (buf) parts.push(buf);
    return parts;
  });
}

export function shortcutsFor(app: ShortcutApp, platform: Platform): (Shortcut & { combo: string })[] {
  return SHORTCUTS.filter((s) => s.app === app && s[platform]).map((s) => ({ ...s, combo: s[platform]! }));
}
