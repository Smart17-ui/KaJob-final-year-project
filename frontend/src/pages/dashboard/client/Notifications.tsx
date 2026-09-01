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
      unread: true,
    },
    {
      id: 2,
      title: "Job application accepted",
      message:
        "Your application for Plumbing Repair was accepted.",
      time: "1 hour ago",
      icon: CheckCircleIcon,
      unread: true,
    },
    {
      id: 3,
      title: "New message",
      message:
        "You received a new message from John Banda.",
      time: "3 hours ago",
      icon: ChatBubbleLeftRightIcon,
      unread: false,
    },
    {
      id: 4,
      title: "Job completed",
      message:
        "Your job Kitchen Installation has been marked as completed.",
      time: "Yesterday",
      icon: BriefcaseIcon,
      unread: false,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <BellIcon className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with activity on your account.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Recent notifications
          </h2>

          <button
            type="button"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div>
          {notifications.map((notification) => {
            const Icon = notification.icon;

            return (
              <div
                key={notification.id}
                className={`
                  flex gap-4 border-b border-slate-100 px-5 py-4
                  transition hover:bg-slate-50
                  ${
                    notification.unread
                      ? "bg-emerald-50/40"
                      : "bg-white"
                  }
                `}
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-500" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {notification.time}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {notification.unread && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Notifications;