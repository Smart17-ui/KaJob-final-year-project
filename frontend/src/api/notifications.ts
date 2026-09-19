import apiClient from "@/api/client";

/* =========================================================
   TYPES
   ========================================================= */

export type Notification = {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  related_entity_id: number | null;
  related_entity_type: string;
  redirect_url: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
};

export type NotificationListResponse = {
  count: number;
  results: Notification[];
};

export type UnreadCountResponse = {
  count: number;
};

export type MarkReadResponse = {
  message: string;
};

export type MarkAllReadResponse = {
  message: string;
  count: number;
};

export type DeleteAllNotificationsResponse = {
  message: string;
  count: number;
};

export type NotificationPreferences = {
  id: number;
  user: number;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  preferences: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

/**
 * Get the current user's notifications.
 *
 * Backend:
 * GET /api/
 */
export const getNotifications =
  async (): Promise<NotificationListResponse> => {
    const data = (await apiClient("/")) as NotificationListResponse;

    return data;
  };

/**
 * Get one notification.
 *
 * Backend:
 * GET /api/{notification_id}/
 */
export const getNotification =
  async (
    notificationId: number
  ): Promise<{ notification: Notification }> => {
    const data = (await apiClient(
      `/${notificationId}/`
    )) as { notification: Notification };

    return data;
  };

/**
 * Mark one notification as read.
 *
 * Backend:
 * POST /api/{notification_id}/read/
 */
export const markNotificationAsRead =
  async (
    notificationId: number
  ): Promise<MarkReadResponse> => {
    const data = (await apiClient(
      `/${notificationId}/read/`,
      {
        method: "POST",
      }
    )) as MarkReadResponse;

    return data;
  };

/**
 * Mark all notifications as read.
 *
 * Backend:
 * POST /api/mark-all-read/
 */
export const markAllNotificationsAsRead =
  async (): Promise<MarkAllReadResponse> => {
    const data = (await apiClient(
      "/mark-all-read/",
      {
        method: "POST",
      }
    )) as MarkAllReadResponse;

    return data;
  };

/**
 * Get unread notification count.
 *
 * Backend:
 * GET /api/unread-count/
 */
export const getUnreadNotificationCount =
  async (): Promise<UnreadCountResponse> => {
    const data = (await apiClient(
      "/unread-count/"
    )) as UnreadCountResponse;

    return data;
  };

/**
 * Delete all notifications.
 *
 * Backend:
 * DELETE /api/delete-all/
 */
export const deleteAllNotifications =
  async (): Promise<DeleteAllNotificationsResponse> => {
    const data = (await apiClient(
      "/delete-all/",
      {
        method: "DELETE",
      }
    )) as DeleteAllNotificationsResponse;

    return data;
  };

/* =========================================================
   NOTIFICATION PREFERENCES
   ========================================================= */

/**
 * Get notification preferences.
 *
 * Backend:
 * GET /api/preferences/
 */
export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    const data = (await apiClient(
      "/preferences/"
    )) as NotificationPreferences;

    return data;
  };

/**
 * Update notification preferences.
 *
 * Backend:
 * PUT /api/preferences/
 */
export const updateNotificationPreferences =
  async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const data = (await apiClient(
      "/preferences/",
      {
        method: "PUT",
        body: JSON.stringify(preferences),
      }
    )) as NotificationPreferences;

    return data;
  };