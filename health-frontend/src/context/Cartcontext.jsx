import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "careconnect_cart";

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    function addToCart(product, quantity = 1) {
        setItems((prev) => {
            const existing = prev.find((x) => x.id === product.id);

            if (existing) {
                const maxStock = product.stock ?? 99;
                return prev.map((x) =>
                    x.id === product.id
                        ? { ...x, quantity: Math.min(maxStock, x.quantity + quantity) }
                        : x
                );
            }

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    mrp: product.mrp,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    stock: product.stock,
                    quantity,
                },
            ];
        });
    }

    function removeFromCart(productId) {
        setItems((prev) => prev.filter((x) => x.id !== productId));
    }

    function updateQuantity(productId, quantity) {
        setItems((prev) =>
            prev.map((x) =>
                x.id === productId
                    ? { ...x, quantity: Math.max(1, Math.min(x.stock ?? 99, quantity)) }
                    : x
            )
        );
    }

    function clearCart() {
        setItems([]);
    }

    const totalCount = items.reduce((sum, x) => sum + x.quantity, 0);
    const totalAmount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalCount,
                totalAmount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside a CartProvider");
    return ctx;
}