import type { Context } from "hono";
import { CartService } from "../services/cartService";

export class cartController {
  async getCart(c: Context): Promise<Response> {
    const data = await CartService.getDetailedCart().catch(() => null);
    return c.json({ success: true, data });
  }

  async addToCart(c: Context): Promise<Response> {
    const item = await c.req.json().catch(() => null);

    if (!item?.id_product || !item.quantity) {
      return c.json({ message: "Invalid item data" }, 400);
    }

    const success = CartService.addItem(item);
    if (!success) {
      return c.json({ message: "Item already in cart or invalid" }, 400);
    }

    return c.json({ success: true, message: "Item added to cart", data: item });
  }

  async updateItemQuantity(c: Context): Promise<Response> {
    const itemId = c.req.param("id");
    const quantity = parseInt(c.req.param("quantity"), 10);

    if (!itemId || isNaN(quantity) || quantity < 0) {
      return c.json({ message: "Missing or invalid itemId or quantity parameter" }, 400);
    }

    const updatedItem = CartService.updateItemQuantity(itemId, quantity);
    if (!updatedItem) {
      return c.json({ message: "Item not found in cart" }, 404);
    }

    return c.json({ success: true, message: "Item quantity updated", data: updatedItem });
  }

  async removeFromCart(c: Context): Promise<Response> {
    const itemId = c.req.param("id");
    if (!itemId) {
      return c.json({ message: "Missing itemId parameter" }, 400);
    }

    const removed = CartService.removeItem(itemId);
    if (!removed) {
      return c.json({ message: "Item not found in cart" }, 404);
    }

    return c.json({ success: true, message: "Item removed from cart" });
  }

  async clearCart(c: Context): Promise<Response> {
    CartService.clear();
    return c.json({ success: true, message: "Cart cleared" });
  }

  async countCart(c: Context): Promise<Response> {
    const summary = await CartService.getSummary();
    if (!summary) {
      return c.json({ success: false, message: "Failed to calculate cart summary" }, 500);
    }

    return c.json({ success: true, data: summary });
  }

  async checkout(c: Context): Promise<Response> {
    const checkoutResult = await CartService.executeCheckout();
    if (!checkoutResult.success) {
      return c.json({ success: false, message: checkoutResult.error }, 500);
    }

    return c.json({ success: true, data: checkoutResult });
  }
}
