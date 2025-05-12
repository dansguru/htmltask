// deriv-chart.js
(function () {
  const iframeWrapper = document.getElementById('iframe-wrapper');
  if (!iframeWrapper) return;

  const iframe = document.createElement('iframe');
  iframe.src = "https://charts.deriv.com/deriv?lang=en&market=synthetic&symbol=R_100&theme=dark&granularity=60&chartType=area";
  iframe.allowFullscreen = true;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.display = "block";
  iframe.style.top = "-60px"; // shift up to visually hide header

  iframeWrapper.appendChild(iframe);
})();
