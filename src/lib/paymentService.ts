// src/lib/paymentService.ts

import { userService } from "./userService";

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  eventsLimit: number;
  photosPerEventLimit: number;
  features: string[];
  stripePriceId: string; // Stripe price ID for production
}

export interface CheckoutSession {
  id: string;
  url: string;
  customerId?: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  date: string;
  downloadUrl: string;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    eventsLimit: 3,
    photosPerEventLimit: 100,
    features: [
      "Up to 3 events per month",
      "100 photos per event",
      "Basic display modes",
      "QR code sharing",
      "24/7 support",
    ],
    stripePriceId: "", // No Stripe price for free plan
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    interval: "month",
    eventsLimit: 25,
    photosPerEventLimit: 1000,
    features: [
      "Up to 25 events per month",
      "1,000 photos per event",
      "All display modes",
      "Custom branding",
      "Advanced analytics",
      "Priority support",
      "Photo collage tools",
    ],
    stripePriceId: "price_1234567890", // Replace with actual Stripe price ID
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    interval: "month",
    eventsLimit: -1, // unlimited
    photosPerEventLimit: -1, // unlimited
    features: [
      "Unlimited events",
      "Unlimited photos",
      "White-label solution",
      "Custom integrations",
      "Dedicated support",
      "Advanced security",
      "Team management",
      "API access",
    ],
    stripePriceId: "price_0987654321", // Replace with actual Stripe price ID
  },
};

class PaymentService {
  /**
   * Create Stripe checkout session for subscription upgrade
   */
  async createCheckoutSession(
    userId: string,
    priceId: string,
    planId: string,
  ): Promise<CheckoutSession> {
    // Placeholder implementation - replace with actual Stripe integration
    console.log("Creating checkout session:", { userId, priceId, planId });

    try {
      // In production, this would call your backend:
      // const response = await fetch(`${this.baseUrl}/create-checkout-session`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, priceId, planId }),
      // });
      // const data = await response.json();
      // return data;

      // Mock response for development
      return {
        id: `cs_mock_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/cs_mock_${Date.now()}`,
        customerId: `cus_mock_${userId}`,
      };
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  }

  /**
   * Handle successful subscription upgrade
   */
  async handleSubscriptionSuccess(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    console.log("Handling subscription success:", { userId, sessionId });

    try {
      // In production, retrieve session from Stripe to get subscription details:
      // const session = await stripe.checkout.sessions.retrieve(sessionId);
      // const subscription = await stripe.subscriptions.retrieve(session.subscription);

      // Mock subscription data for development
      const mockSubscription = {
        customerId: `cus_mock_${userId}`,
        subscriptionId: `sub_mock_${Date.now()}`,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      // Update user subscription in Firestore
      await userService.upgradeSubscription(
        userId,
        "pro", // This would come from the actual subscription data
        mockSubscription,
      );

      console.log("✅ Subscription updated successfully");
    } catch (error) {
      console.error("Failed to handle subscription success:", error);
      throw new Error("Failed to update subscription");
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    console.log("Cancelling subscription for user:", userId);

    try {
      const userProfile = await userService.getUserProfile(userId);
      if (!userProfile?.subscription?.subscriptionId) {
        throw new Error("No active subscription found");
      }

      // In production, cancel with Stripe:
      // await stripe.subscriptions.update(userProfile.subscription.subscriptionId, {
      //   cancel_at_period_end: true,
      // });

      // Update user profile
      await userService.cancelSubscription(userId);

      console.log("✅ Subscription cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    console.log("Getting payment methods for user:", userId);

    try {
      // In production, fetch from Stripe:
      // const userProfile = await userService.getUserProfile(userId);
      // const paymentMethods = await stripe.paymentMethods.list({
      //   customer: userProfile.subscription.customerId,
      //   type: 'card',
      // });
      // return paymentMethods.data.map(pm => ({ ... }));

      // Mock data for development
      return [
        {
          id: "pm_mock_1",
          brand: "visa",
          last4: "4242",
          expiryMonth: 12,
          expiryYear: 2025,
        },
      ];
    } catch (error) {
      console.error("Failed to get payment methods:", error);
      return [];
    }
  }

  /**
   * Get user's invoices
   */
  async getInvoices(userId: string): Promise<Invoice[]> {
    console.log("Getting invoices for user:", userId);

    try {
      // In production, fetch from Stripe:
      // const userProfile = await userService.getUserProfile(userId);
      // const invoices = await stripe.invoices.list({
      //   customer: userProfile.subscription.customerId,
      // });
      // return invoices.data.map(invoice => ({ ... }));

      // Mock data for development
      return [
        {
          id: "in_mock_1",
          amount: 2900, // $29.00 in cents
          currency: "usd",
          status: "paid",
          date: new Date().toISOString(),
          downloadUrl: "#",
        },
      ];
    } catch (error) {
      console.error("Failed to get invoices:", error);
      return [];
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<void> {
    console.log("Updating payment method:", { userId, paymentMethodId });

    try {
      // In production, update with Stripe:
      // const userProfile = await userService.getUserProfile(userId);
      // await stripe.customers.update(userProfile.subscription.customerId, {
      //   invoice_settings: {
      //     default_payment_method: paymentMethodId,
      //   },
      // });

      console.log("✅ Payment method updated successfully");
    } catch (error) {
      console.error("Failed to update payment method:", error);
      throw new Error("Failed to update payment method");
    }
  }

  /**
   * Create customer portal session for subscription management
   */
  async createPortalSession(userId: string): Promise<{ url: string }> {
    console.log("Creating portal session for user:", userId);

    try {
      // In production, create portal session:
      // const userProfile = await userService.getUserProfile(userId);
      // const session = await stripe.billingPortal.sessions.create({
      //   customer: userProfile.subscription.customerId,
      //   return_url: `${window.location.origin}/host/subscription`,
      // });
      // return { url: session.url };

      // Mock for development
      return {
        url: `https://billing.stripe.com/p/session_mock_${Date.now()}`,
      };
    } catch (error) {
      console.error("Failed to create portal session:", error);
      throw new Error("Failed to create portal session");
    }
  }

  /**
   * Verify webhook signature (for backend use)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In production, verify with Stripe webhook secret:
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // try {
    //   stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    //   return true;
    // } catch (err) {
    //   return false;
    // }

    console.log("Webhook verification (mock):", { payload, signature });
    return true; // Mock verification
  }
}

export const paymentService = new PaymentService();
