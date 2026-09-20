// frontend/src/pages/dashboard/worker/Notifications.tsx

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteAllNotifications,
  type Notification,
} from "@/api/notifications";

type Tab = "all" | "unread";

const formatNotificationTime = (date: string) => {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);

  if (s < 60) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  /* =========================================================
     LOAD
     ========================================================= */

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      const list = Array.isArray(listRes)
        ? listRes
        : listRes.results ?? [];

      setNotifications(list);
      setUnreadCount(countRes.count ?? 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* =========================================================
     ACTIONS
     ========================================================= */

  const handleClick = async (n: Notification) => {
    try {
      if (!n.is_read) {
        await markNotificationAsRead(n.id);
        setNotifications((curr) =>
          curr.map((item) =>
            item.id === n.id
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      if (n.redirect_url) {
        navigate(n.redirect_url);
      }
    } catch (err) {
      console.error("Failed to open notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setBusy(true);
    try {
      await markAllNotificationsAsRead();
      const now = new Date().toISOString();
      setNotifications((curr) =>
        curr.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? now }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Delete all notifications? This cannot be undone."
      )
    )
      return;
    setBusy(true);
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to delete all:", err);
    } finally {
      setBusy(false);
    }
  };

  const visible =
    tab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <BellIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }.`
                : "You're all caught up."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading || busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4" />
            Mark all read
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0 || busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            Delete all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {(["all", "unread"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 text-sm font-medium transition ${
              tab === t
                ? "text-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "all" ? "All" : `Unread (${unreadCount})`}
            {tab === t && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-700">
              {tab === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {tab === "unread"
                ? "You've read everything."
                : "Activity will appear here."}
            </p>
          </div>
        ) : (
          visible.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 ${
                n.is_read
                  ? "bg-white hover:bg-slate-50"
                  : "bg-emerald-50 hover:bg-emerald-100"
              }`}
            >
              <div className="pt-1.5">
                <span
                  className={`block h-2 w-2 rounded-full ${
                    n.is_read ? "bg-transparent" : "bg-emerald-500"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`text-sm ${
                      n.is_read
                        ? "font-medium text-slate-700"
                        : "font-semibold text-slate-900"
                    }`}
                  >
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatNotificationTime(n.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{n.message}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
