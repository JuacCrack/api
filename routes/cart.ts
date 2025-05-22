//cart router

import { Hono } from 'hono';
import { cartController } from '../controllers/cartController';

export const cartRouter = new Hono();

const controller = new cartController();

// route add item to cart
cartRouter.post('/agregar', (c) => controller.addToCart(c));
// route remove item from cart
cartRouter.delete('/eliminar/:id', (c) => controller.removeFromCart(c));
// route get cart items
cartRouter.get('/obtener', (c) => controller.getCart(c));
// route clear cart
cartRouter.delete('/limpiar', (c) => controller.clearCart(c));
// route get cart count
cartRouter.get('/contar', (c) => controller.countCart(c));
// route update item quantity in cart
cartRouter.put('/actualizar/:id/:quantity', (c) => controller.updateItemQuantity(c));
// route execute checkout 
cartRouter.post('/checkout', (c) => controller.checkout(c));