"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ArrowLeft, ShoppingBag } from "lucide-react";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    callback: (response: {
      error?: { description?: string };
    }) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }
}

type FulfillmentType = "delivery" | "pickup";

export default function CheckoutPageContent() {
  const today = new Date().toISOString().split("T")[0];

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const { items, subtotal, clearCart, isLoaded } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fulfillment, setFulfillment] =
    useState<FulfillmentType>("delivery");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vijayawada");
  const [pincode, setPincode] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone =
        "Enter a valid 10-digit mobile number.";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (fulfillment === "delivery") {
      if (!address.trim()) {
        newErrors.address = "Please enter your address.";
      }

      if (!city.trim()) {
        newErrors.city = "Please enter your city.";
      }

      if (!pincode.trim()) {
        newErrors.pincode = "Please enter your PIN code.";
      } else if (!/^\d{6}$/.test(pincode.trim())) {
        newErrors.pincode = "PIN code must be 6 digits.";
      }
    }

    if (fulfillment === "pickup" && !pickupDate) {
      newErrors.pickupDate =
        "Please select your pickup date.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load payment gateway. Please try again.",
        );
      }

      // 2. Create our order on the server
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          fulfillment,
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          ...(fulfillment === "delivery"
            ? {
                address,
                city,
                pincode,
              }
            : {
                pickupDate,
              }),
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderResult.error || "Unable to create your order.",
        );
      }

      const internalOrderId = orderResult.order.id;

      // 3. Create Razorpay order on our server
      const paymentResponse = await fetch(
        "/api/payments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: internalOrderId,
          }),
        },
      );

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentResult.error ||
            "Unable to initialize payment.",
        );
      }

      // 4. Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: paymentResult.keyId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        name: "Kanaka Sweets & Bakery",
        description: `Order ${paymentResult.orderNumber}`,
        order_id: paymentResult.razorpayOrderId,

        prefill: {
          name,
          email,
          contact: phone,
        },

        theme: {
          color: "#641C2B",
        },

        // 5. Verify payment on our server
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: internalOrderId,
                  razorpayOrderId:
                    payment.razorpay_order_id,
                  razorpayPaymentId:
                    payment.razorpay_payment_id,
                  razorpaySignature:
                    payment.razorpay_signature,
                }),
              },
            );

            const verifyResult =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyResult.error ||
                  "Payment verification failed.",
              );
            }

            alert(
              `Payment successful!\nOrder Number: ${orderResult.order.orderNumber}`,
            );

            clearCart();
          } catch (verificationError) {
            setApiError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed. Please contact the shop.",
            );
          } finally {
            setIsSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        setApiError(
          response.error?.description ||
            "Payment failed. Please try again.",
        );

        setIsSubmitting(false);
      });

      razorpay.open();
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order.",
      );

      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#76645B]">
          Loading checkout...
        </p>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag
          size={48}
          className="mx-auto mb-5 text-[#D4AD62]"
        />

        <h1 className="text-3xl font-bold text-[#641C2B]">
          Your cart is empty
        </h1>

        <p className="mt-3 text-[#76645B]">
          Add something delicious before proceeding to checkout.
        </p>

        <Link
          href="/sweets"
          className="mt-8 inline-flex rounded-full bg-[#641C2B] px-8 py-3 text-white transition hover:bg-[#4D1420]"
        >
          Explore Products
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#641C2B] hover:text-[#D97732]"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#D97732]">
          Almost There
        </p>

        <h1 className="text-4xl font-bold text-[#641C2B] sm:text-5xl">
          Checkout
        </h1>

        <p className="mt-3 text-[#76645B]">
          Tell us where your delicious order should go.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_380px]"
        noValidate
      >
        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 lg:col-span-2">
            {apiError}
          </div>
        )}

        {/* Customer Form */}
        <div className="space-y-8">
          {/* Customer Information */}
          <div className="rounded-2xl border border-[#E8D8C2] bg-[#FFFAF2] p-5 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-[#641C2B]">
              Customer Details
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-2 block text-sm font-medium text-[#38231F]"
                >
                  Full Name *
                </label>

                <input
                  id="customer-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      name: "",
                    }));
                  }}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                />

                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="customer-phone"
                  className="mb-2 block text-sm font-medium text-[#38231F]"
                >
                  Phone Number *
                </label>

                <input
                  id="customer-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    );

                    setErrors((prev) => ({
                      ...prev,
                      phone: "",
                    }));
                  }}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                />

                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="customer-email"
                  className="mb-2 block text-sm font-medium text-[#38231F]"
                >
                  Email Address *
                </label>

                <input
                  id="customer-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                />

                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          <div className="rounded-2xl border border-[#E8D8C2] bg-[#FFFAF2] p-5 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-[#641C2B]">
              How would you like to receive your order?
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Delivery Option */}
              <button
                type="button"
                onClick={() => {
                  setFulfillment("delivery");
                  setErrors({});
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  fulfillment === "delivery"
                    ? "border-[#641C2B] bg-[#F5E9D8]"
                    : "border-[#E8D8C2] bg-white"
                }`}
              >
                <span className="block text-lg font-semibold text-[#641C2B]">
                  Home Delivery
                </span>

                <span className="mt-2 block text-sm text-[#76645B]">
                  Deliver fresh treats to your doorstep.
                </span>
              </button>

              {/* Pickup Option */}
              <button
                type="button"
                onClick={() => {
                  setFulfillment("pickup");
                  setErrors({});
                }}
                className={`rounded-xl border p-5 text-left transition ${
                  fulfillment === "pickup"
                    ? "border-[#641C2B] bg-[#F5E9D8]"
                    : "border-[#E8D8C2] bg-white"
                }`}
              >
                <span className="block text-lg font-semibold text-[#641C2B]">
                  Shop Pickup
                </span>

                <span className="mt-2 block text-sm text-[#76645B]">
                  Collect your order from our shop.
                </span>
              </button>
            </div>

            {/* Delivery Fields */}
            {fulfillment === "delivery" && (
              <div className="mt-8 space-y-5">
                <h3 className="text-lg font-semibold text-[#38231F]">
                  Delivery Address
                </h3>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-[#38231F]"
                  >
                    Full Address *
                  </label>

                  <textarea
                    id="address"
                    rows={3}
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        address: "",
                      }));
                    }}
                    placeholder="House number, street, area, landmark..."
                    className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                  />

                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City and PIN */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium text-[#38231F]"
                    >
                      City *
                    </label>

                    <input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setErrors((prev) => ({
                          ...prev,
                          city: "",
                        }));
                      }}
                      className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                    />

                    {errors.city && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="pincode"
                      className="mb-2 block text-sm font-medium text-[#38231F]"
                    >
                      PIN Code *
                    </label>

                    <input
                      id="pincode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        );

                        setErrors((prev) => ({
                          ...prev,
                          pincode: "",
                        }));
                      }}
                      placeholder="6-digit PIN code"
                      className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                    />

                    {errors.pincode && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pickup Fields */}
            {fulfillment === "pickup" && (
              <div className="mt-8">
                <label
                  htmlFor="pickup-date"
                  className="mb-2 block text-sm font-medium text-[#38231F]"
                >
                  Pickup Date *
                </label>

                <input
                  id="pickup-date"
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      pickupDate: "",
                    }));
                  }}
                  className="w-full rounded-lg border border-[#E8D8C2] bg-white px-4 py-3 text-base outline-none focus:border-[#641C2B]"
                />

                {errors.pickupDate && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pickupDate}
                  </p>
                )}

                <p className="mt-3 text-sm text-[#76645B]">
                  Pickup details and timing will be confirmed by the shop.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <aside className="h-fit rounded-2xl border border-[#E8D8C2] bg-[#FFFAF2] p-5 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#641C2B]">
            Your Order
          </h2>

          <div className="mt-6 space-y-5">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-[#38231F]">
                    {item.productName}
                  </p>

                  <p className="mt-1 text-sm text-[#76645B]">
                    {item.variantName} × {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 font-medium text-[#641C2B]">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-[#E8D8C2] pt-6">
            <div className="flex justify-between text-[#76645B]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="mt-4 flex justify-between text-lg font-semibold text-[#38231F]">
              <span>Total</span>

              <span className="text-[#641C2B]">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mt-3 text-sm text-[#76645B]">
              Delivery charges, if applicable, will be confirmed before payment.
            </p>
          </div>

          {/* Payment Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-full bg-[#641C2B] px-6 py-4 font-semibold text-white transition hover:bg-[#4D1420] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating Your Order..."
              : "Continue to Payment"}
          </button>

          <p className="mt-4 text-center text-xs text-[#76645B]">
            Your order details will be verified securely.
          </p>
        </aside>
      </form>
    </section>
  );
}
