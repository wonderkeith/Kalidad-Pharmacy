class PaymentProvider {
  async initiate() { throw new Error('Payment provider is not configured.'); }
  async verifyWebhook() { throw new Error('Payment provider is not configured.'); }
}
class ConfiguredPaymentProvider extends PaymentProvider {
  constructor(config={}) { super(); this.name=config.name||'unconfigured'; }
}
module.exports = { PaymentProvider, ConfiguredPaymentProvider };
