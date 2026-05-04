import type { StoredOrder } from "../types";

const STORAGE_KEY = "fast_pizza_orders";

function readOrders(): StoredOrder[] {
	if (typeof window === "undefined") return [];

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];

		const parsed = JSON.parse(raw) as unknown;
		return Array.isArray(parsed) ? (parsed as StoredOrder[]) : [];
	} catch {
		return [];
	}
}

function writeOrders(orders: StoredOrder[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function saveOrder(order: StoredOrder) {
	const orders = readOrders();
	const nextOrders = orders.filter((existing) => existing.id !== order.id);
	nextOrders.unshift(order);
	writeOrders(nextOrders);
	return order;
}

export function getOrderById(orderId: string) {
	return readOrders().find((order) => order.id === orderId) ?? null;
}