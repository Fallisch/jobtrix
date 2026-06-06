const deMessages = require('../messages/de.json');
module.exports = async function getRequestConfig() {
  return { locale: 'de', messages: deMessages };
};
