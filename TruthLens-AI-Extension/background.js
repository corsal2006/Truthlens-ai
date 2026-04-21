chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TRUTHLENS_TOGGLE_PANEL" });
  } catch (error) {
    console.warn("TruthLens AI content script is unavailable on this page.", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRUTHLENS_CAPTURE_VISIBLE_TAB") {
    chrome.tabs.captureVisibleTab(sender.tab?.windowId, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          ok: false,
          error: chrome.runtime.lastError.message
        });
        return;
      }

      sendResponse({
        ok: true,
        dataUrl
      });
    });

    return true;
  }

  return false;
});
