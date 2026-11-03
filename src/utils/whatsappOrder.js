import { formatPrice } from "./formatPrice";

export const buildOrderMessage = (order) => {
  const lines = order.items.map(
    (item, i) =>
      `${i + 1}. ${item.name}\n` +
      `   ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n` +
      `   ${window.location.origin}/products/${item.product_id}`
  );

  return [
    "Hello Slay With Tife! 👋 I'd like to confirm my order.",
    "",
    `Order ref: ${order.ref}`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(Number(order.total))}`,
    "",
    `Name: ${order.customer_name}`,
    order.customer_email ? `Email: ${order.customer_email}` : null,
    order.note ? `Note: ${order.note}` : null,
    "",
    "Please confirm availability, delivery cost and how to pay. Thank you!",
  ]
    .filter((line) => line !== null)
    .join("\n");
};