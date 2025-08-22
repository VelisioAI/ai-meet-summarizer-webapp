"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AuthProvider } from "@/contexts/AuthContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Elements>
  );
}
