const PANEL_MARGIN = 16;
const STORAGE_KEY = 'analytics-test-runner-size';

export function getDefaultPanelSize() {
  return {
    width: Math.min(Math.round(window.innerWidth * 0.9), window.innerWidth - PANEL_MARGIN * 2),
    height: Math.round(window.innerHeight * 0.55),
  };
}

export function getMaxPanelSize() {
  return {
    width: window.innerWidth - PANEL_MARGIN * 2,
    height: window.innerHeight - PANEL_MARGIN * 2,
  };
}

function clampSize(width, height, minSize) {
  const max = getMaxPanelSize();
  return {
    width: Math.min(max.width, Math.max(minSize.width, Math.round(width))),
    height: Math.min(max.height, Math.max(minSize.height, Math.round(height))),
  };
}

function loadStoredSize(minSize) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.width || !parsed?.height) return null;
    return clampSize(parsed.width, parsed.height, minSize);
  } catch {
    return null;
  }
}

function saveSize(size) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
  } catch {
    // ignore quota errors
  }
}

export function applyPanelSize(panel, size) {
  panel.style.width = `${size.width}px`;
  panel.style.height = `${size.height}px`;
}

export function initPanelResize(panel) {
  const minSize = getDefaultPanelSize();
  const initial = loadStoredSize(minSize) || minSize;

  panel.style.minWidth = `${minSize.width}px`;
  panel.style.minHeight = `${minSize.height}px`;
  applyPanelSize(panel, initial);

  const handle = panel.querySelector('[data-resize-handle]');
  if (!handle || handle.dataset.resizeBound === 'true') return;
  handle.dataset.resizeBound = 'true';

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  handle.addEventListener('mousedown', (event) => {
    event.preventDefault();
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = panel.offsetWidth;
    startHeight = panel.offsetHeight;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
  });

  window.addEventListener('mousemove', (event) => {
    if (!dragging) return;
    const deltaX = startX - event.clientX;
    const deltaY = startY - event.clientY;
    const next = clampSize(startWidth + deltaX, startHeight + deltaY, minSize);
    applyPanelSize(panel, next);
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    saveSize({ width: panel.offsetWidth, height: panel.offsetHeight });
  });
}
