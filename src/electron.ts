import windowStateManager from 'electron-window-state';
import contextMenu from 'electron-context-menu';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import reloader from 'electron-reloader';

try {
  reloader(module);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error(e);
}

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 3000;
const dev = !app.isPackaged;
let mainWindow: BrowserWindow | null;

function createWindow() {
  const windowState = windowStateManager({
    defaultWidth: 800,
    defaultHeight: 600,
  });

  const mainWin = new BrowserWindow({
    backgroundColor: 'whitesmoke',
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    trafficLightPosition: {
      x: 17,
      y: 32,
    },
    minHeight: 450,
    minWidth: 500,
    webPreferences: {
      enableRemoteModule: true,
      contextIsolation: true,
      nodeIntegration: true,
      spellcheck: false,
      devTools: dev,
    },
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
  });

  windowState.manage(mainWin);

  mainWin.once('ready-to-show', () => {
    mainWin.show();
    mainWin.focus();
  });

  mainWin.on('close', () => {
    windowState.saveState(mainWin);
  });

  return mainWin;
}

contextMenu({
  showLookUpSelection: false,
  showSearchWithGoogle: false,
  showCopyImage: false,
  prepend: () => [
    {
      label: 'Make App 💻',
    },
  ],
});

function loadVite(portNum: number | string) {
  mainWindow?.loadURL(`http://localhost:${portNum}`).catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error loading URL, retrying', e);
    setTimeout(() => {
      loadVite(portNum);
    }, 200);
  });
}

function createMainWindow() {
  mainWindow = createWindow();
  mainWindow.once('close', () => { mainWindow = null; });

  if (dev) loadVite(port);
  else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});