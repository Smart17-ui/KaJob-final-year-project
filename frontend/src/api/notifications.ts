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

export type DeleteNotificationResponse = {
  message: string;
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
 * Backend: GET /api/notifications/
 */
export const getNotifications =
  async (): Promise<NotificationListResponse> => {
    return (await apiClient(
      "/notifications/"
    )) as NotificationListResponse;
  };

/**
 * Get one notification.
 *
 * Backend: GET /api/notifications/{id}/
 */
export const getNotification = async (
  notificationId: number
): Promise<{ notification: Notification }> => {
  return (await apiClient(
    `/notifications/${notificationId}/`
  )) as { notification: Notification };
};

/**
 * Mark one notification as read.
 *
 * Backend: POST /api/notifications/{id}/read/
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<MarkReadResponse> => {
  return (await apiClient(
    `/notifications/${notificationId}/read/`,
    {
      method: "POST",
    }
  )) as MarkReadResponse;
};

/**
 * Mark all notifications as read.
 *
 * Backend: POST /api/notifications/mark-all-read/
 */
export const markAllNotificationsAsRead =
  async (): Promise<MarkAllReadResponse> => {
    return (await apiClient(
      "/notifications/mark-all-read/",
      {
        method: "POST",
      }
    )) as MarkAllReadResponse;
  };

/**
 * Get unread notification count.
 *
 * Backend: GET /api/notifications/unread-count/
 */
export const getUnreadNotificationCount =
  async (): Promise<UnreadCountResponse> => {
    return (await apiClient(
      "/notifications/unread-count/"
    )) as UnreadCountResponse;
  };

/**
 * Delete one notification.
 *
 * Backend:
 * DELETE /api/notifications/{id}/delete/
 */
export const deleteNotification = async (
  notificationId: number
): Promise<DeleteNotificationResponse> => {
  return (await apiClient(
    `/notifications/${notificationId}/delete/`,
    {
      method: "DELETE",
    }
  )) as DeleteNotificationResponse;
};

/**
 * Delete all notifications.
 *
 * Backend: DELETE /api/notifications/delete-all/
 */
export const deleteAllNotifications =
  async (): Promise<DeleteAllNotificationsResponse> => {
    return (await apiClient(
      "/notifications/delete-all/",
      {
        method: "DELETE",
      }
    )) as DeleteAllNotificationsResponse;
  };

/* =========================================================
   NOTIFICATION PREFERENCES
   ========================================================= */

/**
 * Get notification preferences.
 *
 * Backend: GET /api/notifications/preferences/
 */
export const getNotificationPreferences =
  async (): Promise<NotificationPreferences> => {
    return (await apiClient(
      "/notifications/preferences/"
    )) as NotificationPreferences;
  };

/**
 * Update notification preferences.
 *
 * Backend: PUT /api/notifications/preferences/
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  return (await apiClient(
    "/notifications/preferences/",
    {
      method: "PUT",
      body: JSON.stringify(preferences),
    }
  )) as NotificationPreferences;
};