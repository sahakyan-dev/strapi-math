module.exports = [
  'strapi::errors',
  // 'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Enable the download of the Monaco editor
          // from cdn.jsdelivr.net.
          "script-src": ["'self'", "blob:"],
          upgradeInsecureRequests: null,
        },
      },
      // When importing data, imported file size may exceed the file size limit of the server
      // jsonLimit: '10mb',
    },
  },
];
