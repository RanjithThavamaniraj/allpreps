/**
 * Payment abstraction layer — interfaces only.
 * Future implementations: RazorpayProvider, StripeProvider
 */

/**
 * @typedef {'monthly'|'annual'} BillingInterval
 */

/**
 * @typedef {Object} PlanDefinition
 * @property {string} id
 * @property {string} name
 * @property {number} priceInr
 * @property {BillingInterval} interval
 * @property {string[]} features
 */

/**
 * @typedef {Object} CheckoutSession
 * @property {string} id
 * @property {string|null} url
 * @property {'pending'|'completed'|'failed'} status
 */

/**
 * @typedef {Object} CouponResult
 * @property {boolean} valid
 * @property {number} discountPercent
 * @property {string|null} message
 */

/**
 * Base payment provider — not implemented until Razorpay/Stripe integration.
 */
export class PaymentProvider {
  /**
   * @param {string} planId
   * @param {{ couponCode?: string, interval?: BillingInterval }} _options
   * @returns {Promise<CheckoutSession>}
   */
  async createCheckoutSession(planId, _options = {}) {
    throw new Error(`PaymentProvider.createCheckoutSession not implemented (plan: ${planId})`);
  }

  /**
   * @param {string} subscriptionId
   * @returns {Promise<void>}
   */
  async cancelSubscription(subscriptionId) {
    throw new Error(`PaymentProvider.cancelSubscription not implemented (id: ${subscriptionId})`);
  }

  /**
   * @param {string} code
   * @returns {Promise<CouponResult>}
   */
  async applyCoupon(code) {
    throw new Error(`PaymentProvider.applyCoupon not implemented (code: ${code})`);
  }

  /**
   * @param {string} _sessionId
   * @returns {Promise<{ plan: string, status: string }>}
   */
  async verifyPayment(_sessionId) {
    throw new Error('PaymentProvider.verifyPayment not implemented');
  }
}

/** @type {PlanDefinition[]} */
export const AVAILABLE_PLANS = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    priceInr: 299,
    interval: 'monthly',
    features: [],
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    priceInr: 2990,
    interval: 'annual',
    features: [],
  },
];

/**
 * Placeholder factory for future provider selection.
 * @param {'razorpay'|'stripe'} _provider
 * @returns {PaymentProvider}
 */
export function createPaymentProvider(_provider) {
  return new PaymentProvider();
}
