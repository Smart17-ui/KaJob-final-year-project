import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import apiClient from "@/api/client";

interface NotificationPreferences {
  job_posted: boolean;
  job_completed: boolean;
  warning_issued: boolean;
  report_resolved: boolean;
  review_received: boolean;
  worker_assigned: boolean;
  account_suspended: boolean;
  application_received: boolean;
  verification_approved: boolean;
  verification_rejected: boolean;
}

interface NotificationSettings {
  id: number;
  user: number;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

type PreferenceKey = keyof NotificationPreferences;

const NotificationsSection = () => {
  const [settings, setSettings] =
    useState<NotificationSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient(
          "/notifications/preferences/",
          {
            method: "GET",
          }
        );

        setSettings(response);
      } catch (err) {
        console.error(
          "Failed to load notification preferences:",
          err
        );

        setError(
          "Unable to load your notification preferences."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotificationSettings();
  }, []);

  const updateChannel = async (
    key: "email_enabled" | "in_app_enabled" | "push_enabled"
  ) => {
    if (!settings || savingKey) return;

    const previousValue = settings[key];
    const newValue = !previousValue;

    setSettings((current) =>
      current
        ? {
            ...current,
            [key]: newValue,
          }
        : current
    );

    setSavingKey(key);
    setSavedKey(null);
    setError("");

    try {
      const response = await apiClient(
        "/notifications/preferences/",
        {
          method: "PUT",
          body: JSON.stringify({
            [key]: newValue,
          }),
        }
      );

      setSettings(response);
      setSavedKey(key);

      setTimeout(() => {
        setSavedKey((current) =>
          current === key ? null : current
        );
      }, 1500);
    } catch (err) {
      console.error(
        `Failed to update ${key}:`,
        err
      );

      setSettings((current) =>
        current
          ? {
              ...current,
              [key]: previousValue,
            }
          : current
      );

      setError(
        "Unable to save your notification preference. Please try again."
      );
    } finally {
      setSavingKey(null);
    }
  };

  const updatePreference = async (
    key: PreferenceKey
  ) => {
    if (!settings || savingKey) return;

    const previousValue = settings.preferences[key];
    const newValue = !previousValue;

    setSettings((current) =>
      current
        ? {
            ...current,
            preferences: {
              ...current.preferences,
              [key]: newValue,
            },
          }
        : current
    );

    setSavingKey(key);
    setSavedKey(null);
    setError("");

    try {
      const response = await apiClient(
        "/notifications/preferences/",
        {
          method: "PUT",
          body: JSON.stringify({
            preferences: {
              [key]: newValue,
            },
          }),
        }
      );

      setSettings(response);
      setSavedKey(key);

      setTimeout(() => {
        setSavedKey((current) =>
          current === key ? null : current
        );
      }, 1500);
    } catch (err) {
      console.error(
        `Failed to update notification preference ${key}:`,
        err
      );

      setSettings((current) =>
        current
          ? {
              ...current,
              preferences: {
                ...current.preferences,
                [key]: previousValue,
              },
            }
          : current
      );

      setError(
        "Unable to save your notification preference. Please try again."
      );
    } finally {
      setSavingKey(null);
    }
  };

  const notificationPreferences: {
    key: PreferenceKey;
    label: string;
    description: string;
  }[] = [
    {
      key: "job_posted",
      label: "Job posted",
      description:
        "Notifications when a relevant job is posted.",
    },
    {
      key: "worker_assigned",
      label: "Worker assigned",
      description:
        "Updates when a worker is assigned to a job.",
    },
    {
      key: "application_received",
      label: "Application received",
      description:
        "Notifications when someone applies to your job.",
    },
    {
      key: "job_completed",
      label: "Job completed",
      description:
        "Updates when a job is marked as completed.",
    },
    {
      key: "review_received",
      label: "Review received",
      description:
        "Notifications when you receive a review.",
    },
    {
      key: "verification_approved",
      label: "Verification approved",
      description:
        "Notifications when your verification is approved.",
    },
    {
      key: "verification_rejected",
      label: "Verification rejected",
      description:
        "Notifications when your verification is rejected.",
    },
    {
      key: "warning_issued",
      label: "Warning issued",
      description:
        "Notifications when a warning is issued to your account.",
    },
    {
      key: "report_resolved",
      label: "Report resolved",
      description:
        "Updates when a report you submitted is resolved.",
    },
    {
      key: "account_suspended",
      label: "Account suspended",
      description:
        "Important notifications about account suspension.",
    },
  ];

  const channels = [
    {
      key: "email_enabled" as const,
      label: "Email notifications",
      description:
        "Receive important notifications through email.",
      icon: EnvelopeIcon,
    },
    {
      key: "in_app_enabled" as const,
      label: "In-app notifications",
      description:
        "Receive notifications inside KaJob.",
      icon: BellIcon,
    },
    {
      key: "push_enabled" as const,
      label: "Push notifications",
      description:
        "Receive notifications through device push alerts.",
      icon: DevicePhoneMobileIcon,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-600">
          {error ||
            "Unable to load your notification preferences."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Notifications
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Choose how and when you want to receive notifications
          from KaJob.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Notification Channels */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Notification Channels
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose where you want to receive KaJob notifications.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const enabled = settings[channel.key];
            const saving = savingKey === channel.key;
            const saved = savedKey === channel.key;

            return (
              <div
                key={channel.key}
                className="flex flex-col items-start gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-500" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {channel.label}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {channel.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {saved && (
                    <span className="text-xs font-medium text-green-600">
                      Saved
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      updateChannel(channel.key)
                    }
                    disabled={savingKey !== null}
                    aria-label={`Toggle ${channel.label}`}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                      enabled
                        ? "bg-gray-900"
                        : "bg-gray-300"
                    } ${
                      saving
                        ? "cursor-wait opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        enabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Notification Types */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900">
            Notification Preferences
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose which types of events you want to be notified
            about.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {notificationPreferences.map((item) => {
            const enabled =
              settings.preferences[item.key];

            const saving = savingKey === item.key;
            const saved = savedKey === item.key;

            return (
              <div
                key={item.key}
                className="flex flex-col items-start gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {saved && (
                    <span className="text-xs font-medium text-green-600">
                      Saved
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      updatePreference(item.key)
                    }
                    disabled={savingKey !== null}
                    aria-label={`Toggle ${item.label}`}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                      enabled
                        ? "bg-gray-900"
                        : "bg-gray-300"
                    } ${
                      saving
                        ? "cursor-wait opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        enabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Information */}
      <div className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

        <div>
          <p className="text-sm font-medium text-gray-700">
            About notifications
          </p>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Some important account and security notifications
            may still be sent when necessary.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSection;
