class PaymentProvider { async createPayment() { throw new Error('Payment provider is not configured.'); } async verifyWebhook() { throw new Error('Payment provider is not configured.'); } }
class DeliveryProvider { async createDelivery() { throw new Error('Delivery provider is not configured.'); } async getTracking() { throw new Error('Delivery provider is not configured.'); } }
class NotificationProvider { async send() { return { delivered:false, reason:'notification provider not configured' }; } }
class AIProvider { async answer() { return { type:'handoff', message:'A pharmacist should assist with this question.' }; } }
module.exports={PaymentProvider,DeliveryProvider,NotificationProvider,AIProvider};
