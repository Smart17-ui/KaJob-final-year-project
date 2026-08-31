"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import { SelectedPage } from "@/shared/types";

type Props = {
  setSelectedPage: (value: SelectedPage) => void;
};

/* =========================
   CONTACT INFORMATION
========================= */

const contactInformation = [
  {
    title: "Call Us",
    description: "+260 97X XXX XXX",
    icon: PhoneIcon,
    color: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Email Us",
    description: "support@kajob.com",
    icon: EnvelopeIcon,
    color: "from-purple-50 to-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Location",
    description: "Lusaka, Zambia",
    icon: MapPinIcon,
    color: "from-emerald-50 to-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Live Support",
    description: "Chat with our team",
    icon: ChatBubbleLeftRightIcon,
    color: "from-orange-50 to-orange-100",
    iconColor: "text-orange-600",
  },
];

/* =========================
   CARD ANIMATION
========================= */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/* =========================
   CONTACT US
========================= */

const ContactUs = ({ setSelectedPage }: Props) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formState, setFormState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [formError, setFormError] = useState("");

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /* =========================
     HANDLE FORM SUBMIT
  ========================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setFormState("loading");
    setFormError("");

    if (!formData.name || !formData.email || !formData.message) {
      setFormState("error");
      setFormError("Please fill in all required fields");
      return;
    }

    setTimeout(() => {
      setFormState("success");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setFormState("idle");
      }, 3000);
    }, 1500);
  };

  return (
    <motion.section
      id="contact-us"
      className="relative w-full overflow-hidden scroll-mt-20 bg-white py-20 md:py-28"
      onViewportEnter={() =>
        setSelectedPage(SelectedPage.ContactUs)
      }
      viewport={{
        amount: 0.15,
      }}
    >
      {/* =========================
          DECORATIVE BACKGROUND
      ========================= */}

      <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-primary-50/20 blur-3xl" />

      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-primary-50/10 blur-3xl" />

      {/* =========================
          MAIN CONTAINER
      ========================= */}

      <div className="mx-auto w-5/6 max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <motion.div
          className="mb-16 text-center"
          initial={{
            opacity: 0,
            y: -30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            amount: 0.2,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          {/* Badge */}

          <div className="mb-4 inline-block">
            <span className="rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-600">
              Get in Touch
            </span>
          </div>

          {/* Heading */}

          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            We're here to support you
          </h2>

          {/* Description */}

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Have a question or need help? Our team is ready to assist you.
          </p>
        </motion.div>

        {/* =========================
            CONTACT INFORMATION CARDS
        ========================= */}

        <motion.div
          className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: false,
            amount: 0.2,
          }}
        >
          {contactInformation.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Hover Background */}

                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${item.color} opacity-0 transition duration-300 group-hover:opacity-50`}
                />

                {/* Icon */}

                <div className="mb-4 inline-flex rounded-lg bg-gray-50 p-3 transition group-hover:bg-gray-100">
                  <Icon
                    className={`h-6 w-6 ${item.iconColor}`}
                  />
                </div>

                {/* Title */}

                <h3 className="font-semibold text-gray-900">
                  {item.title}
                </h3>

                {/* Description */}

                <p className="mt-2 text-sm text-gray-600 transition group-hover:text-gray-700">
                  {item.description}
                </p>

                {/* Accent Line */}

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 group-hover:w-full" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: false,
              amount: 0.2,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="space-y-8"
          >

            {/* Heading and Description */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: false,
                amount: 0.2,
              }}
              transition={{
                duration: 0.4,
              }}
            >
              <h3 className="text-3xl font-bold text-gray-900">
                Let's connect
              </h3>

              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                KaJob is built on trust and community. If you have a question,
                need assistance, or want to share feedback, we'd love to hear
                from you.
              </p>
            </motion.div>

            {/* =========================
                SUPPORT CARD
            ========================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: false,
                amount: 0.2,
              }}
              transition={{
                duration: 0.4,
                delay: 0.05,
              }}
              whileHover={{
                scale: 1.02,
              }}
              className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50 p-6"
            >
              <div className="flex items-start gap-4">

                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">
                    Quick Response
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Our team typically responds within a few hours.
                  </p>
                </div>

              </div>
            </motion.div>

            {/* =========================
                RESPONSE TIME
            ========================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: false,
                amount: 0.2,
              }}
              transition={{
                duration: 0.4,
                delay: 0.1,
              }}
              className="grid grid-cols-2 gap-4"
            >

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-600">
                  Average Response
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  2 hours
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-600">
                  Available
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  24/7
                </p>
              </div>

            </motion.div>
          </motion.div>

          {/* =========================
              RIGHT SIDE - FORM
          ========================= */}

          <motion.div
            initial={{
              opacity: 0,
              x: 50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: false,
              amount: 0.2,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50">

              {/* Form Heading */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: false,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                <h3 className="text-2xl font-bold text-gray-900">
                  Send us a message
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  Fill out the form below and we'll get back to you shortly.
                </p>
              </motion.div>

              {/* =========================
                  FORM
              ========================= */}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >

                {/* NAME */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: false,
                    amount: 0.1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.05,
                  }}
                >
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Full Name{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200 placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </motion.div>

                {/* EMAIL */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: false,
                    amount: 0.1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                  }}
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Email Address{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200 placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </motion.div>

                {/* SUBJECT */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: false,
                    amount: 0.1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.15,
                  }}
                >
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200 placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </motion.div>

                {/* MESSAGE */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: false,
                    amount: 0.1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                  }}
                >
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Message{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    className="mt-2 w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200 placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                </motion.div>

                {/* =========================
                    ERROR MESSAGE
                ========================= */}

                {formState === "error" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="flex items-center gap-3 rounded-lg bg-red-50 p-4 ring-1 ring-red-200"
                  >
                    <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-red-500" />

                    <p className="text-sm text-red-700">
                      {formError}
                    </p>
                  </motion.div>
                )}

                {/* =========================
                    SUCCESS MESSAGE
                ========================= */}

                {formState === "success" && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 ring-1 ring-emerald-200"
                  >
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-500" />

                    <p className="text-sm text-emerald-700">
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}

                {/* =========================
                    SUBMIT BUTTON
                ========================= */}

                <motion.button
                  whileHover={{
                    scale: formState === "idle" ? 1.02 : 1,
                  }}
                  whileTap={{
                    scale: formState === "idle" ? 0.98 : 1,
                  }}
                  type="submit"
                  disabled={
                    formState === "loading" ||
                    formState === "success"
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {formState === "loading" ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : formState === "success" ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Message Sent
                    </>
                  ) : (
                    <>
                      Send Message
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </>
                  )}
                </motion.button>

                {/* Privacy Message */}

                <p className="text-center text-xs text-gray-500">
                  We respect your privacy. Your information is secure with us.
                </p>

              </form>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
};

export default ContactUs;