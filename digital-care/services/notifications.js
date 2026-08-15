class NotificationProvider {
  async send() { throw new Error('Notification provider is not configured.'); }
}
class ConfiguredNotificationProvider extends NotificationProvider {
  constructor(config={}) { super(); this.name=config.name||'unconfigured'; }
}
module.exports = { NotificationProvider, ConfiguredNotificationProvider };
