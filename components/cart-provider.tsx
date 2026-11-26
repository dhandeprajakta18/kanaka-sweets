"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  slug: string;
  image: string;
  variantName: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  addToCart: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isLoaded: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "kanaka-sweets-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(STORAGE_KEY);

      if (storedCart) {
        const parsedCart: unknown = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          window.setTimeout(() => setItems(parsedCart), 0);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems((previousItems) => {
      const existing = previousItems.find(
        (cartItem) => cartItem.variantId === item.variantId
      );

      if (existing) {
        return previousItems.map((cartItem) =>
          cartItem.variantId === item.variantId
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      return [...previousItems, item];
    });
  };

  const removeItem = (variantId: string) => {
    setItems((previousItems) =>
      previousItems.filter((item) => item.variantId !== variantId)
    );
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        addToCart: addItem,
        removeItem,
        removeFromCart: removeItem,
        updateQuantity,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
