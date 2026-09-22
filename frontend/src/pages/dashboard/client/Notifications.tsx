import {
  BellIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { useCallback, useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  type Notification,
} from "@/api/notifications";

import ConfirmationModal from "@/components/pop/ConfirmationModal/ConfirmationModal";

const Notifications = () => {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [isMarkingAllRead, setIsMarkingAllRead] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [isDeletingAll, setIsDeletingAll] =
    useState(false);

  /*
   * CONFIRMATION MODAL
   */
  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [isClearAllModalOpen, setIsClearAllModalOpen] =
    useState(false);

  const [selectedNotificationId, setSelectedNotificationId] =
    useState<number | null>(null);

  /*
   * LOAD NOTIFICATIONS
   */
  const loadNotifications = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await getNotifications();

        const list = Array.isArray(response)
          ? response
          : response.results ?? [];

        setNotifications(list);
      } catch (err) {
        console.error(
          "Failed to load notifications:",
          err
        );

        setError(
          "We couldn't load your notifications. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  /*
   * MARK ONE AS READ
   */
  const handleMarkAsRead = async (
    notification: Notification
  ) => {
    if (notification.is_read) {
      return;
    }

    try {
      await markNotificationAsRead(
        notification.id
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
                read_at:
                  new Date().toISOString(),
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  /*
   * MARK ALL AS READ
   */
  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some(
      (notification) => !notification.is_read
    );

    if (!hasUnread) {
      return;
    }

    try {
      setIsMarkingAllRead(true);

      await markAllNotificationsAsRead();

      const now =
        new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at:
            notification.read_at ?? now,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  /*
   * OPEN DELETE ONE MODAL
   */
  const handleDeleteClick = (
    notificationId: number
  ) => {
    setSelectedNotificationId(
      notificationId
    );

    setIsDeleteModalOpen(true);
  };

  /*
   * DELETE ONE NOTIFICATION
   */
  const handleConfirmDelete = async () => {
    if (selectedNotificationId === null) {
      return;
    }

    try {
      setDeletingId(
        selectedNotificationId
      );

      await deleteNotification(
        selectedNotificationId
      );

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !==
            selectedNotificationId
        )
      );

      setIsDeleteModalOpen(false);
      setSelectedNotificationId(null);
    } catch (err) {
      console.error(
        "Failed to delete notification:",
        err
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * CANCEL DELETE ONE
   */
  const handleCancelDelete = () => {
    if (deletingId !== null) {
      return;
    }

    setIsDeleteModalOpen(false);
    setSelectedNotificationId(null);
  };

  /*
   * OPEN CLEAR ALL MODAL
   */
  const handleDeleteAllClick = () => {
    if (notifications.length === 0) {
      return;
    }

    setIsClearAllModalOpen(true);
  };

  /*
   * DELETE ALL NOTIFICATIONS
   */
  const handleConfirmDeleteAll = async () => {
    try {
      setIsDeletingAll(true);

      await deleteAllNotifications();

      setNotifications([]);

      setIsClearAllModalOpen(false);
    } catch (err) {
      console.error(
        "Failed to delete all notifications:",
        err
      );
    } finally {
      setIsDeletingAll(false);
    }
  };

  /*
   * CANCEL CLEAR ALL
   */
  const handleCancelDeleteAll = () => {
    if (isDeletingAll) {
      return;
    }

    setIsClearAllModalOpen(false);
  };

  /*
   * OPEN NOTIFICATION
   */
  const handleNotificationClick = async (
    notification: Notification
  ) => {
    await handleMarkAsRead(notification);

    if (notification.redirect_url) {
      window.location.href =
        notification.redirect_url;
    }
  };

  /*
   * FORMAT TIME
   */
  const formatNotificationTime = (
    date: string
  ) => {
    const notificationDate =
      new Date(date);

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  /*
   * GET NOTIFICATION ICON
   */
  const getNotificationIcon = (
    notificationType: string
  ) => {
    const type =
      notificationType.toLowerCase();

    if (
      type.includes("application") ||
      type.includes("apply")
    ) {
      return DocumentTextIcon;
    }

    if (
      type.includes("accepted") ||
      type.includes("accept") ||
      type.includes("complete") ||
      type.includes("completed")
    ) {
      return CheckCircleIcon;
    }

    if (
      type.includes("message") ||
      type.includes("chat")
    ) {
      return ChatBubbleLeftRightIcon;
    }

    if (
      type.includes("job")
    ) {
      return BriefcaseIcon;
    }

    if (
      type.includes("warning") ||
      type.includes("cancel")
    ) {
      return ExclamationTriangleIcon;
    }

    return BellIcon;
  };

  /*
   * GET ICON BACKGROUND
   */
  const getIconBackground = (
    notificationType: string
  ) => {
    const type =
      notificationType.toLowerCase();

    if (
      type.includes("application") ||
      type.includes("apply")
    ) {
      return "bg-blue-50";
    }

    if (
      type.includes("accepted") ||
      type.includes("accept") ||
      type.includes("complete") ||
      type.includes("completed")
    ) {
      return "bg-emerald-50";
    }

    if (
      type.includes("message") ||
      type.includes("chat")
    ) {
      return "bg-purple-50";
    }

    if (
      type.includes("job")
    ) {
      return "bg-amber-50";
    }

    if (
      type.includes("warning") ||
      type.includes("cancel")
    ) {
      return "bg-red-50";
    }

    return "bg-slate-50";
  };

  /*
   * GET ICON COLOR
   */
  const getIconColor = (
    notificationType: string
  ) => {
    const type =
      notificationType.toLowerCase();

    if (
      type.includes("application") ||
      type.includes("apply")
    ) {
      return "text-blue-600";
    }

    if (
      type.includes("accepted") ||
      type.includes("accept") ||
      type.includes("complete") ||
      type.includes("completed")
    ) {
      return "text-emerald-600";
    }

    if (
      type.includes("message") ||
      type.includes("chat")
    ) {
      return "text-purple-600";
    }

    if (
      type.includes("job")
    ) {
      return "text-amber-600";
    }

    if (
      type.includes("warning") ||
      type.includes("cancel")
    ) {
      return "text-red-600";
    }

    return "text-slate-600";
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {/* HEADER */}
          <section className="mb-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <BellIcon className="h-6 w-6 text-amber-600" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Notifications
                </h1>

                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Stay updated with all activity
                  on your account.
                </p>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS CARD */}
          <section>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* SECTION HEADER */}
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent activity
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {notifications.length === 0
                      ? "No notifications"
                      : unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount === 1
                            ? ""
                            : "s"
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllAsRead
                      }
                      disabled={
                        isMarkingAllRead
                      }
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-lg
                        px-3 py-2
                        text-xs font-semibold
                        text-amber-600
                        transition
                        hover:bg-amber-50
                        hover:text-amber-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <CheckIcon className="h-4 w-4" />

                      {isMarkingAllRead
                        ? "Marking..."
                        : "Mark all as read"}
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleDeleteAllClick
                      }
                      disabled={
                        isDeletingAll
                      }
                      className="
                        inline-flex items-center
                        gap-1.5 rounded-lg
                        px-3 py-2
                        text-xs font-semibold
                        text-red-600
                        transition
                        hover:bg-red-50
                        hover:text-red-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <TrashIcon className="h-4 w-4" />

                      {isDeletingAll
                        ? "Clearing..."
                        : "Clear all"}
                    </button>
                  )}
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="border-b border-red-100 bg-red-50 px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={
                        loadNotifications
                      }
                      className="
                        shrink-0 rounded-lg
                        bg-white px-3 py-1.5
                        text-xs font-semibold
                        text-red-700
                        shadow-sm
                        ring-1 ring-red-200
                        hover:bg-red-50
                      "
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* LOADING */}
              {isLoading ? (
                <div className="divide-y divide-slate-100">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-4 px-4 py-5 sm:px-6"
                    >
                      <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />

                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />

                        <div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-slate-100" />

                        <div className="mt-2 h-3 w-1/5 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex min-h-72 items-center justify-center px-6 py-12">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <BellIcon className="h-7 w-7 text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      All caught up
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      You have no notifications
                      right now. New activity
                      will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                /* NOTIFICATIONS LIST */
                <div className="divide-y divide-slate-100">
                  {notifications.map(
                    (notification) => {
                      const Icon =
                        getNotificationIcon(
                          notification.notification_type
                        );

                      const isDeleting =
                        deletingId ===
                        notification.id;

                      return (
                        <div
                          key={
                            notification.id
                          }
                          className={`
                            group flex items-start
                            gap-3 px-4 py-5
                            transition
                            sm:gap-4 sm:px-6
                            ${
                              notification.is_read
                                ? "bg-white hover:bg-slate-50/70"
                                : "bg-amber-50/30 hover:bg-amber-50/60"
                            }
                          `}
                        >
                          {/* ICON */}
                          <div
                            className={`
                              flex h-11 w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              ${getIconBackground(
                                notification.notification_type
                              )}
                            `}
                          >
                            <Icon
                              className={`
                                h-6 w-6
                                ${getIconColor(
                                  notification.notification_type
                                )}
                              `}
                            />
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() =>
                                void handleNotificationClick(
                                  notification
                                )
                              }
                              className="
                                w-full text-left
                                focus:outline-none
                              "
                            >
                              <div className="flex items-start gap-2">
                                <p
                                  className={`
                                    text-sm
                                    ${
                                      notification.is_read
                                        ? "font-medium text-slate-700"
                                        : "font-semibold text-slate-900"
                                    }
                                  `}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.is_read && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                )}
                              </div>

                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {
                                  notification.message
                                }
                              </p>

                              <p className="mt-2 text-xs text-slate-400">
                                {formatNotificationTime(
                                  notification.created_at
                                )}
                              </p>
                            </button>

                            {/* ACTIONS */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {!notification.is_read && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleMarkAsRead(
                                      notification
                                    )
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    bg-amber-50
                                    px-3 py-1.5
                                    text-xs
                                    font-medium
                                    text-amber-700
                                    transition
                                    hover:bg-amber-100
                                  "
                                >
                                  <CheckIcon className="h-3.5 w-3.5" />

                                  Mark read
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteClick(
                                    notification.id
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  px-3 py-1.5
                                  text-xs
                                  font-medium
                                  text-red-600
                                  transition
                                  hover:bg-red-50
                                  hover:text-red-700
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                <TrashIcon className="h-3.5 w-3.5" />

                                {isDeleting
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* DELETE ONE CONFIRMATION */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete notification?"
        message="This notification will be permanently removed from your account. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={
          selectedNotificationId !== null &&
          deletingId === selectedNotificationId
        }
        onConfirm={() =>
          void handleConfirmDelete()
        }
        onCancel={handleCancelDelete}
      />

      {/* CLEAR ALL CONFIRMATION */}
      <ConfirmationModal
        isOpen={isClearAllModalOpen}
        title="Clear all notifications?"
        message="All notifications will be permanently removed from your account. This action cannot be undone."
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeletingAll}
        onConfirm={() =>
          void handleConfirmDeleteAll()
        }
        onCancel={handleCancelDeleteAll}
      />
    </>
  );
};

export default Notifications;