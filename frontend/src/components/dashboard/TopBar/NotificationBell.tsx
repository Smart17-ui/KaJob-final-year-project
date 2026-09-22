import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  BellIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteAllNotifications,
  type Notification,
} from "@/api/notifications";

import ConfirmationModal from "@/components/pop/ConfirmationModal/ConfirmationModal";

type UserRole = "CLIENT" | "WORKER";

type NotificationBellProps = {
  userRole: UserRole;
  onNotificationsClick?: () => void;
};

const POLL_INTERVAL_MS = 30_000;

const NotificationBell = ({
  userRole,
  onNotificationsClick,
}: NotificationBellProps) => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isMarkingAllRead, setIsMarkingAllRead] =
    useState(false);

  const [isClearingAll, setIsClearingAll] =
    useState(false);

  const [isClearModalOpen, setIsClearModalOpen] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  /*
   * Keeps track of the latest notification request.
   *
   * If a previous role's request finishes after the
   * current role's request, its response is ignored.
   */
  const requestIdRef = useRef(0);

  /*
   * NOTIFICATION PAGE
   */
  const notificationsPagePath =
    userRole === "WORKER"
      ? "/worker/dashboard/notifications"
      : "/client/dashboard/notifications";

  /*
   * LOAD NOTIFICATIONS
   */
  const loadNotifications = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setIsLoading(true);

      const [
        notificationResponse,
        unreadResponse,
      ] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      /*
       * Ignore the response if another request has already
       * started after this one.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      const list = Array.isArray(notificationResponse)
        ? notificationResponse
        : notificationResponse.results ?? [];

      setNotifications(list);
      setUnreadCount(unreadResponse.count ?? 0);
    } catch (error) {
      /*
       * Ignore errors from stale requests.
       */
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      /*
       * Only the current request should control loading state.
       */
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [userRole]);

  /*
   * ROLE CHANGE
   */
  useEffect(() => {
    /*
     * Invalidate every request belonging to the
     * previous role.
     */
    requestIdRef.current += 1;

    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
    setIsClearModalOpen(false);

    /*
     * Load notifications using the newly selected role/token.
     */
    void loadNotifications();
  }, [userRole, loadNotifications]);

  /*
   * POLLING
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        const requestId = ++requestIdRef.current;

        getUnreadNotificationCount()
          .then((response) => {
            /*
             * Ignore polling responses that belong to
             * an older role/request.
             */
            if (requestId !== requestIdRef.current) {
              return;
            }

            setUnreadCount(response.count ?? 0);
          })
          .catch(() => {
            /*
             * Ignore temporary network errors.
             */
          });
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOpen, userRole]);

  /*
   * CLOSE WHEN CLICKING OUTSIDE
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        notificationRef.current.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * TOGGLE
   */
  const handleNotificationsClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const willOpen = !isOpen;

    setIsOpen(willOpen);

    if (willOpen) {
      void loadNotifications();
    }

    onNotificationsClick?.();
  };

  /*
   * MARK SINGLE AS READ
   */
  const handleNotificationClick = async (
    notification: Notification
  ) => {
    try {
      if (!notification.is_read) {
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

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }

      setIsOpen(false);

      if (notification.redirect_url) {
        navigate(notification.redirect_url);
      }
    } catch (error) {
      console.error(
        "Failed to open notification:",
        error
      );
    }
  };

  /*
   * VIEW ALL
   */
  const handleViewAll = () => {
    setIsOpen(false);

    navigate(notificationsPagePath);
  };

  /*
   * MARK ALL AS READ
   */
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setIsMarkingAllRead(true);

      await markAllNotificationsAsRead();

      const now = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
          read_at:
            notification.read_at ?? now,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  /*
   * OPEN CLEAR CONFIRMATION MODAL
   */
  const handleClearClick = () => {
    if (notifications.length === 0) {
      return;
    }

    setIsClearModalOpen(true);
  };

  /*
   * CLEAR ALL NOTIFICATIONS
   */
  const handleConfirmClearAll = async () => {
    try {
      setIsClearingAll(true);

      await deleteAllNotifications();

      setNotifications([]);
      setUnreadCount(0);
      setIsClearModalOpen(false);
    } catch (error) {
      console.error(
        "Failed to clear notifications:",
        error
      );
    } finally {
      setIsClearingAll(false);
    }
  };

  /*
   * CANCEL CLEAR
   */
  const handleCancelClear = () => {
    if (isClearingAll) {
      return;
    }

    setIsClearModalOpen(false);
  };

  /*
   * FORMAT TIME
   */
  const formatNotificationTime = (
    date: string
  ) => {
    const notificationDate = new Date(date);
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

  return (
    <>
      <div
        ref={notificationRef}
        className="relative"
      >
        <button
          type="button"
          onClick={handleNotificationsClick}
          className="
            group relative flex h-10 w-10
            items-center justify-center
            rounded-lg text-slate-500
            transition-all duration-200
            hover:bg-slate-100
            hover:text-emerald-600
            active:scale-95
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            focus:ring-offset-2
          "
          aria-label="View notifications"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <BellIcon className="h-5 w-5" />

          {unreadCount > 0 && (
            <span
              className="
                absolute right-1.5 top-1.5
                flex min-h-[16px] min-w-[16px]
                items-center justify-center
                rounded-full bg-emerald-600
                px-1 text-[9px] font-bold text-white
              "
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            className="
              absolute right-0 z-50 mt-3
              w-[360px] overflow-hidden
              rounded-xl border border-slate-200
              bg-white shadow-xl
            "
          >
            {/* HEADER */}
            <div
              className="
                flex items-center justify-between
                border-b border-slate-200
                px-4 py-3
              "
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {unreadCount} unread
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllRead}
                    className="
                      text-xs font-medium
                      text-emerald-600
                      hover:text-emerald-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isMarkingAllRead
                      ? "Marking..."
                      : "Mark all as read"}
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearClick}
                    disabled={isClearingAll}
                    className="
                      inline-flex items-center gap-1
                      text-xs font-medium
                      text-red-500
                      transition
                      hover:text-red-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                    title="Clear all notifications"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* LIST */}
            <div className="max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center px-4 py-10">
                  <div
                    className="
                      h-6 w-6 animate-spin
                      rounded-full border-2
                      border-slate-300
                      border-t-emerald-600
                    "
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <BellIcon className="mx-auto h-9 w-9 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No notifications
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    You're all caught up.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`
                      block w-full
                      border-b border-slate-100
                      px-4 py-3
                      text-left transition
                      last:border-b-0
                      ${
                        notification.is_read
                          ? "bg-white hover:bg-slate-50"
                          : "bg-emerald-50 hover:bg-emerald-100"
                      }
                    `}
                  >
                    <div className="flex gap-3">
                      <div className="pt-1.5">
                        <span
                          className={`
                            block h-2 w-2 rounded-full
                            ${
                              notification.is_read
                                ? "bg-transparent"
                                : "bg-emerald-500"
                            }
                          `}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
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
                            {notification.title}
                          </p>

                          <span
                            className="
                              shrink-0
                              text-[10px]
                              text-slate-400
                            "
                          >
                            {formatNotificationTime(
                              notification.created_at
                            )}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1 line-clamp-2
                            text-xs leading-5
                            text-slate-500
                          "
                        >
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div
              className="
                border-t border-slate-200
                bg-slate-50
                px-4 py-2.5 text-center
              "
            >
              <button
                type="button"
                onClick={handleViewAll}
                className="
                  rounded-lg px-3 py-1.5
                  text-xs font-medium
                  text-emerald-600
                  transition
                  hover:bg-emerald-50
                  hover:text-emerald-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
                  focus:ring-offset-1
                "
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CLEAR CONFIRMATION */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Clear all notifications?"
        message="This will permanently remove all your notifications. This action cannot be undone."
        confirmLabel="Clear notifications"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isClearingAll}
        onConfirm={handleConfirmClearAll}
        onCancel={handleCancelClear}
      />
    </>
  );
};

export default NotificationBell;