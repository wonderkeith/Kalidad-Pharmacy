class DeliveryProvider {
  async createDelivery() { throw new Error('Delivery provider is not configured.'); }
  async getStatus() { throw new Error('Delivery provider is not configured.'); }
}
class ConfiguredDeliveryProvider extends DeliveryProvider {
  constructor(config={}) { super(); this.name=config.name||'unconfigured'; }
}
module.exports = { DeliveryProvider, ConfiguredDeliveryProvider };
