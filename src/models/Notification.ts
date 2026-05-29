import type { Notification } from '../types/domain/notification';

// ─── Notification helpers ─────────────────────────────────────────────────────
export function unreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length;
}

export function hasUnread(notifications: Notification[]): boolean {
  return notifications.some((n) => !n.read);
}

export function markAllAsRead(notifications: Notification[]): Notification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}
