import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  FaceSmileIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

/* =========================
   TYPES
========================= */

type Message = {
  id: number;
  sender: "worker" | "client";
  text: string;
  time: string;
};

type Conversation = {
  id: number;
  clientName: string;
  clientInitials: string;
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: Message[];
};

/* =========================
   SAMPLE CONVERSATIONS
========================= */

const initialConversations: Conversation[] = [
  {
    id: 1,
    clientName: "John Banda",
    clientInitials: "JB",
    jobTitle: "Garden Maintenance",
    lastMessage:
      "What time can you start tomorrow?",
    lastMessageTime: "09:24",
    unread: 2,

    messages: [
      {
        id: 1,
        sender: "client",
        text: "Hi, are you available for the garden maintenance job?",
        time: "09:10",
      },
      {
        id: 2,
        sender: "worker",
        text: "Yes, I'm available. I would be happy to do the job.",
        time: "09:15",
      },
      {
        id: 3,
        sender: "client",
        text: "Great. What time can you start tomorrow?",
        time: "09:24",
      },
    ],
  },

  {
    id: 2,
    clientName: "Mary Phiri",
    clientInitials: "MP",
    jobTitle: "House Painting",
    lastMessage:
      "I'll send you the exact location.",
    lastMessageTime: "Yesterday",
    unread: 0,

    messages: [
      {
        id: 1,
        sender: "worker",
        text: "Hello Mary, I wanted to confirm the painting job.",
        time: "15:20",
      },
      {
        id: 2,
        sender: "client",
        text: "Sure. The job is still available.",
        time: "15:30",
      },
      {
        id: 3,
        sender: "client",
        text: "I'll send you the exact location.",
        time: "15:35",
      },
    ],
  },

  {
    id: 3,
    clientName: "Peter Mwale",
    clientInitials: "PM",
    jobTitle: "Furniture Assembly",
    lastMessage:
      "Thank you for completing the job.",
    lastMessageTime: "Monday",
    unread: 0,

    messages: [
      {
        id: 1,
        sender: "client",
        text: "Are you able to assemble the furniture today?",
        time: "10:10",
      },
      {
        id: 2,
        sender: "worker",
        text: "Yes, I can come this afternoon.",
        time: "10:15",
      },
      {
        id: 3,
        sender: "client",
        text: "Thank you for completing the job.",
        time: "17:40",
      },
    ],
  },
];

/* =========================
   MESSAGES
========================= */

const Messages = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>(
      initialConversations
    );

  const [selectedConversationId, setSelectedConversationId] =
    useState<number | null>(
      initialConversations[0]?.id ?? null
    );

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [showConversation, setShowConversation] =
    useState(false);

  /* =========================
     FILTER CONVERSATIONS
  ========================= */

  const filteredConversations =
    useMemo(() => {
      return conversations.filter(
        (conversation) =>
          conversation.clientName
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          conversation.jobTitle
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }, [conversations, search]);

  /* =========================
     SELECTED CONVERSATION
  ========================= */

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId
    );

  /* =========================
     SELECT CONVERSATION
  ========================= */

  const handleSelectConversation = (
    id: number
  ) => {
    setSelectedConversationId(id);
    setShowConversation(true);

    /*
     * Mark messages as read.
     */

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              unread: 0,
            }
          : conversation
      )
    );
  };

  /* =========================
     SEND MESSAGE
  ========================= */

  const handleSendMessage = () => {
    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      !selectedConversation
    ) {
      return;
    }

    const newMessage: Message = {
      id:
        selectedConversation.messages
          .length + 1,

      sender: "worker",

      text: trimmedMessage,

      time: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id ===
        selectedConversation.id
          ? {
              ...conversation,

              messages: [
                ...conversation.messages,
                newMessage,
              ],

              lastMessage:
                trimmedMessage,

              lastMessageTime:
                newMessage.time,
            }
          : conversation
      )
    );

    setMessage("");
  };

  /* =========================
     ENTER TO SEND
  ========================= */

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Messages
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Communicate with clients about
          your jobs.
        </p>
      </section>

      {/* =========================
          MESSAGING CONTAINER
      ========================= */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="flex h-[650px]">

          {/* ==================================================
              CONVERSATION LIST
          ================================================== */}

          <div
            className={`w-full border-r border-slate-200 md:w-80 lg:w-96 ${
              showConversation
                ? "hidden md:block"
                : "block"
            }`}
          >

            {/* SEARCH */}

            <div className="border-b border-slate-200 p-4">

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">

                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search conversations..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

              </div>

            </div>

            {/* CONVERSATIONS */}

            <div className="h-[calc(650px-81px)] overflow-y-auto">

              {filteredConversations.length >
              0 ? (

                filteredConversations.map(
                  (conversation) => (

                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectConversation(
                          conversation.id
                        )
                      }
                      className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                        selectedConversationId ===
                        conversation.id
                          ? "bg-emerald-50"
                          : ""
                      }`}
                    >

                      {/* AVATAR */}

                      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">

                        {
                          conversation.clientInitials
                        }

                        {conversation.unread >
                          0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                            {
                              conversation.unread
                            }
                          </span>
                        )}

                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <h3
                            className={`truncate text-sm ${
                              conversation.unread >
                              0
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {
                              conversation.clientName
                            }
                          </h3>

                          <span className="flex-shrink-0 text-[11px] text-slate-400">
                            {
                              conversation.lastMessageTime
                            }
                          </span>

                        </div>

                        <p className="mt-0.5 truncate text-xs font-medium text-emerald-600">
                          {
                            conversation.jobTitle
                          }
                        </p>

                        <p
                          className={`mt-1 truncate text-xs ${
                            conversation.unread >
                            0
                              ? "font-medium text-slate-700"
                              : "text-slate-500"
                          }`}
                        >
                          {
                            conversation.lastMessage
                          }
                        </p>

                      </div>

                    </button>

                  )
                )

              ) : (

                <div className="flex h-full items-center justify-center px-6">

                  <div className="text-center">

                    <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No conversations found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try a different search.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* ==================================================
              CHAT AREA
          ================================================== */}

          <div
            className={`flex min-w-0 flex-1 flex-col ${
              showConversation
                ? "flex"
                : "hidden md:flex"
            }`}
          >

            {selectedConversation ? (

              <>

                {/* =========================
                    CHAT HEADER
                ========================= */}

                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">

                  <div className="flex min-w-0 items-center gap-3">

                    {/* MOBILE BACK */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowConversation(
                          false
                        )
                      }
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                    </button>

                    {/* AVATAR */}

                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {
                        selectedConversation.clientInitials
                      }
                    </div>

                    {/* CLIENT */}

                    <div className="min-w-0">

                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {
                          selectedConversation.clientName
                        }
                      </h2>

                      <p className="truncate text-xs text-slate-500">
                        {
                          selectedConversation.jobTitle
                        }
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>

                </div>

                {/* =========================
                    JOB INFO
                ========================= */}

                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">

                  <p className="text-xs text-slate-500">
                    Conversation about
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {
                      selectedConversation.jobTitle
                    }
                  </p>

                </div>

                {/* =========================
                    MESSAGES
                ========================= */}

                <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">

                  {selectedConversation.messages.map(
                    (item) => (

                      <div
                        key={item.id}
                        className={`flex ${
                          item.sender ===
                          "worker"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[80%] sm:max-w-[65%] ${
                            item.sender ===
                            "worker"
                              ? "items-end"
                              : "items-start"
                          }`}
                        >

                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                              item.sender ===
                              "worker"
                                ? "rounded-br-md bg-emerald-600 text-white"
                                : "rounded-bl-md bg-white text-slate-700 shadow-sm"
                            }`}
                          >
                            {item.text}
                          </div>

                          <p
                            className={`mt-1 text-[10px] text-slate-400 ${
                              item.sender ===
                              "worker"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {item.time}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

                {/* =========================
                    MESSAGE INPUT
                ========================= */}

                <div className="border-t border-slate-200 bg-white p-3 sm:p-4">

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">

                    {/* ATTACHMENT */}

                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <PaperClipIcon className="h-5 w-5" />
                    </button>

                    {/* INPUT */}

                    <input
                      type="text"
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      placeholder="Type a message..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    {/* EMOJI */}

                    <button
                      type="button"
                      className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sm:block"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>

                    {/* SEND */}

                    <button
                      type="button"
                      onClick={
                        handleSendMessage
                      }
                      disabled={
                        !message.trim()
                      }
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>

                  </div>

                  <p className="mt-2 hidden text-[11px] text-slate-400 sm:block">
                    Press Enter to send
                  </p>

                </div>

              </>

            ) : (

              /* =========================
                 NO CONVERSATION SELECTED
              ========================= */

              <div className="flex flex-1 items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">

                    <PaperAirplaneIcon className="h-6 w-6 text-slate-400" />

                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    Select a conversation
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose a conversation to
                    start messaging.
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>

    </div>
  );
};

export default Messages;