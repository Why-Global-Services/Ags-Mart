export const GA_TRACKING_ID = "G-HQSLGCVPPX";

export const gaEvent = (action, params = {}) => {
  if (!window.gtag) return;

  window.gtag("event", action, params);
};
