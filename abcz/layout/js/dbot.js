// dbot.js
(function () {
    const wrapper = document.getElementById('dbot-iframe-wrapper');
    wrapper.innerHTML = ""; // Clear existing iframe

    // Set dark theme styles on the wrapper
    wrapper.style.position = "relative";
    wrapper.style.overflow = "hidden";
    wrapper.style.backgroundColor = "#121212"; // Dark background
    wrapper.style.borderRadius = "8px";
    wrapper.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";

    // Create and style the iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://dbot.deriv.com/#bot_builder/?app_id=69913`;
    iframe.allowFullscreen = true;
    iframe.style.position = "absolute";
    iframe.style.top = "-60px"; // shift up to visually hide header
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "calc(100% + 60px)";
    iframe.style.border = "none";

    wrapper.appendChild(iframe);
})();
