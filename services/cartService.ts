import { BaseModel } from "../models/BaseModel";
import MercadoPagoLib from "../libs/mercadoPago";

export interface CartItem {
  id_product: string;
  quantity: number;
}

interface Product {
  nombre: string;
  precios: string[];
  imagenes: string[];
}

let cartCache: CartItem[] = [];

export const CartService = {
  getCart(): CartItem[] {
    return [...cartCache];
  },

  getItem(id: string): CartItem | null {
    return cartCache.find(item => item.id_product === id) || null;
  },

  async getDetailedCart(): Promise<(CartItem & Partial<Product>)[]> {
    return await Promise.all(
      cartCache.map(async item => {
        const result = await BaseModel.select(
          "productos",
          ["nombre, precios, imagenes"],
          1,
          { id: parseInt(item.id_product) }
        ).catch(() => null);

        const product = Array.isArray(result) ? result[0] as Product : null;

        return {
          ...item,
          ...(product || {})
        };
      })
    );
  },

  addItem(item: CartItem): boolean {
    if (!item.id_product || !item.quantity || this.getItem(item.id_product)) return false;
    cartCache.push(item);
    return true;
  },

  updateItemQuantity(id: string, quantity: number): CartItem | null {
    const index = cartCache.findIndex(item => item.id_product == id);
    if (index === -1) return null;
    if (cartCache[index]) {
      cartCache[index].quantity = quantity;
    }
    return cartCache[index] ?? null;
  },

  removeItem(id: string): boolean {
    const index = cartCache.findIndex(item => item.id_product == id);
    if (index === -1) return false;
    cartCache.splice(index, 1);
    return true;
  },

  clear(): void {
    cartCache = [];
  },

  async getSummary(): Promise<{ totalItems: number; totalPrice: number } | null> {
    const detailedCart = await this.getDetailedCart().catch(() => null);
    if (!detailedCart) return null;

    const totalPrice = detailedCart.reduce((acc, item) => {
      const price = parseFloat((item.precios && item.precios[0]) || "0");
      return acc + price * item.quantity;
    }, 0);

    return {
      totalItems: cartCache.length,
      totalPrice
    };
  },

async executeCheckout(): Promise<{ success: boolean; preferenceId?: string; error?: string; details?: any }> {
    console.log("Starting executeCheckout...");

    const summary = await this.getSummary().catch(err => {
        console.error("Error calculating cart summary:", err);
        return null;
    });
    console.log("Cart summary:", summary);
    if (!summary) return { success: false, error: "Failed to calculate cart summary" };

    const items = await this.getDetailedCart().catch(err => {
        console.error("Error getting detailed cart:", err);
        return null;
    });
    console.log("Detailed cart items:", items);
    if (!items) return { success: false, error: "Failed to get detailed cart" };

    console.log("Initializing MercadoPagoLib...");
    const mercadoPago = new MercadoPagoLib("APP_USR-8650941230034689-051118-fa869414808c312102abbb342558a408-2431970945");

    const formattedItems = items.map(item => ({
        id: item.id_product,
        title: item.nombre || "Unknown Product",
        quantity: item.quantity,
        unit_price: parseFloat((item.precios && item.precios[0]) || "0")
    }));

    console.log("Creating Mercado Pago preference with items:", formattedItems);
    const preference = await mercadoPago.createPreference(formattedItems, {
        back_urls: {
            success: "https://juaccrack.github.io/ShopV1/public/shopping-cart.html?checkout=1",
            failure: "https://juaccrack.github.io/ShopV1/public/shopping-cart.html?checkout=0",
            pending: "https://juaccrack.github.io/ShopV1/public/shopping-cart.html?checkout=2"
        },
        auto_return: "approved"
    }).catch(err => {
        console.error("Error creating Mercado Pago preference:", err);
        return null;
    });

    console.log("Mercado Pago preference:", preference);
    if (!preference) return { success: false, error: "Failed to create Mercado Pago preference" };

    console.log("Checkout executed successfully. Preference ID:", preference.id);
    return {
        success: true,
        preferenceId: preference.id,
        details: preference,
    };
}


};
