import {
  BellIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: "New application received",
      message:
        "A worker has applied for your job: House Cleaning.",
      time: "10 minutes ago",
      icon: DocumentTextIcon,
      type: "application",
      unread: true,
    },
    {
      id: 2,
      title: "Job application accepted",
      message:
        "Your application for Plumbing Repair was accepted.",
      time: "1 hour ago",
      icon: CheckCircleIcon,
      type: "accepted",
      unread: true,
    },
    {
      id: 3,
      title: "New message",
      message:
        "You received a new message from John Banda.",
      time: "3 hours ago",
      icon: ChatBubbleLeftRightIcon,
      type: "message",
      unread: false,
    },
    {
      id: 4,
      title: "Job completed",
      message:
        "Your job Kitchen Installation has been marked as completed.",
      time: "Yesterday",
      icon: BriefcaseIcon,
      type: "completed",
      unread: false,
    },
  ];

  const getIconBackground = (type: string) => {
    switch (type) {
      case "application":
        return "bg-blue-50";
      case "accepted":
        return "bg-emerald-50";
      case "message":
        return "bg-purple-50";
      case "completed":
        return "bg-amber-50";
      default:
        return "bg-slate-50";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "application":
        return "text-blue-600";
      case "accepted":
        return "text-emerald-600";
      case "message":
        return "text-purple-600";
      case "completed":
        return "text-amber-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* HEADER */}
        <section className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <BellIcon className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Notifications
              </h1>

              <p className="mt-2 text-slate-600">
                Stay updated with all activity on your account.
              </p>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS SECTION */}
        <section>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* SECTION HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent activity
              </h2>

              <button
                type="button"
                className="text-sm font-semibold text-amber-600 transition hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-200 px-3 py-2 rounded-lg"
              >
                Mark all as read
              </button>
            </div>

            {/* NOTIFICATIONS LIST */}
            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="flex min-h-64 items-center justify-center px-6 py-12">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <BellIcon className="h-7 w-7 text-slate-400" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      All caught up
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      You have no new notifications. Come back
                      later!
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-4 px-6 py-5 transition hover:bg-slate-50/50 ${
                        notification.unread
                          ? "bg-amber-50/30"
                          : "bg-white"
                      }`}
                    >
                      {/* ICON */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconBackground(
                          notification.type
                        )}`}
                      >
                        <Icon
                          className={`h-6 w-6 ${getIconColor(
                            notification.type
                          )}`}
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {notification.title}
                              </p>

                              {notification.unread && (
                                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                              )}
                            </div>

                            <p className="mt-1 text-sm text-slate-600">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              {notification.time}
                            </p>
                          </div>

                          {/* ACTION AREA */}
                          {notification.unread && (
                            <button
                              type="button"
                              className="mt-0.5 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 transition hover:bg-amber-200"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
                >
                  Load more notifications
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Notifications;
