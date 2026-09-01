import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Messages = () => {
  return (
    <div className="h-[calc(100vh-10rem)] min-h-[600px] overflow-hidden rounded-xl border border-slate-200 bg-white">

      {/* =========================
          HEADER
      ========================= */}

      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Messages
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Communicate with workers about your jobs.
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          MESSAGES AREA
      ========================= */}

      <div className="flex h-[calc(100%-89px)]">

        {/* =========================
            CONVERSATIONS SIDEBAR
        ========================= */}

        <div className="flex w-full max-w-sm flex-col border-r border-slate-200">

          {/* SEARCH */}

          <div className="border-b border-slate-100 p-4">

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">

              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

            </div>

          </div>

          {/* EMPTY CONVERSATIONS */}

          <div className="flex flex-1 items-center justify-center px-6">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-emerald-600" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No conversations yet
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your conversations with workers will
                appear here.
              </p>

            </div>

          </div>

        </div>

        {/* =========================
            CHAT AREA
        ========================= */}

        <div className="hidden flex-1 items-center justify-center md:flex">

          <div className="max-w-sm px-6 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

              <ChatBubbleLeftRightIcon className="h-8 w-8 text-slate-400" />

            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Select a conversation
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Select a conversation from the list to
              start communicating with a worker.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Messages;