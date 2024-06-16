// content.ts
function extractMagnetLinks() {
  const htmlContent = document.documentElement.outerHTML;
  const magnetRegex = /magnet:\?xt=urn:[a-zA-Z0-9]+:[a-zA-Z0-9]{32,}/g;
  const magnetLinks = htmlContent.match(magnetRegex) || [];

  return magnetLinks;
}

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractMagnetLinks') {
    const magnetLinks = extractMagnetLinks();
    sendResponse({ magnetLinks });
  }
});
