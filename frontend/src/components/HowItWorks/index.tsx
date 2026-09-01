"use client";

import { useState } from "react";
import { SelectedPage } from "@/shared/types";
import { motion } from "framer-motion";

import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

type Props = {
  setSelectedPage: (value: SelectedPage) => void;
};

type UserType = "client" | "worker";

// =========================
// ANIMATION VARIANTS
// =========================

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariant = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

// =========================
// CLIENT STEPS
// =========================

const clientSteps = [
  {
    id: "01",
    title: "Post a Job",
    description:
      "Create a job listing and explain the task you need help with. Set your budget and timeline.",
    icon: MagnifyingGlassIcon,
  },
  {
    id: "02",
    title: "Review & Hire",
    description:
      "Review worker profiles and proposals. Choose the worker who best fits your task and needs.",
    icon: UserGroupIcon,
  },
  {
    id: "03",
    title: "Get It Done",
    description:
      "Work with your chosen worker to complete the task. Rate and review when finished.",
    icon: CheckCircleIcon,
  },
];

// =========================
// WORKER STEPS
// =========================

const workerSteps = [
  {
    id: "01",
    title: "Find Nearby Jobs",
    description:
      "Discover piecework opportunities near you that match your skills and availability.",
    icon: MagnifyingGlassIcon,
  },
  {
    id: "02",
    title: "Apply & Connect",
    description:
      "Submit your proposal for jobs you're interested in and connect with clients who need your skills.",
    icon: UserGroupIcon,
  },
  {
    id: "03",
    title: "Earn Money",
    description:
      "Complete the task and get paid. Build your reputation through ratings and reviews.",
    icon: CheckCircleIcon,
  },
];

// =========================
// HOW IT WORKS
// =========================

const HowItWorks = ({ setSelectedPage }: Props) => {
  const [userType, setUserType] = useState<UserType>("client");

  const steps = userType === "client" ? clientSteps : workerSteps;

  return (
    <section
      id="how-it-works"
      className="mx-auto mb-0 min-h-full w-5/6 scroll-mt-20 py-20"
    >
      <motion.div
        onViewportEnter={() =>
          setSelectedPage(SelectedPage.HowItWorks)
        }
      >
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          {/* TITLE */}

          <motion.div
            className="md:w-1/2"
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
              amount: 0.5,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              How It Works
            </h2>
          </motion.div>

          {/* =========================
              GREEN SLIDING TOGGLE
          ========================= */}

          <motion.div
            className="flex justify-center"
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
              amount: 0.5,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
          >
            <div
              className="
                relative
                flex
                h-12
                w-[280px]
                items-center
                rounded-full
                bg-gray-100
                p-1
                shadow-inner
              "
            >
              {/* SLIDING GREEN BACKGROUND */}

              <motion.div
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                className="
                  absolute
                  left-1
                  top-1
                  h-10
                  w-[137px]
                  rounded-full
                  bg-emerald-500
                  shadow-md
                "
                animate={{
                  x: userType === "client" ? 0 : 139,
                }}
              />

              {/* FOR HIRING */}

              <button
                type="button"
                onClick={() => setUserType("client")}
                className={`
                  relative
                  z-10
                  h-10
                  w-1/2
                  rounded-full
                  text-sm
                  font-semibold
                  transition-colors
                  duration-300
                  ${
                    userType === "client"
                      ? "text-white"
                      : "text-gray-600"
                  }
                `}
              >
                For Hiring
              </button>

              {/* FINDING WORK */}

              <button
                type="button"
                onClick={() => setUserType("worker")}
                className={`
                  relative
                  z-10
                  h-10
                  w-1/2
                  rounded-full
                  text-sm
                  font-semibold
                  transition-colors
                  duration-300
                  ${
                    userType === "worker"
                      ? "text-white"
                      : "text-gray-600"
                  }
                `}
              >
                Finding Work
              </button>
            </div>
          </motion.div>
        </div>

        {/* =========================
            SUBTITLE
        ========================= */}

        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
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
            amount: 0.5,
          }}
          transition={{
            duration: 0.5,
            delay: 0.1,
          }}
        >
          <p className="text-sm leading-6 text-gray-600 md:text-base">
            {userType === "client"
              ? "Post tasks, hire talented workers, and get things done quickly in your community."
              : "Find local piecework that matches your skills, apply, and start earning."}
          </p>
        </motion.div>

        {/* =========================
            STEPS CARDS
        ========================= */}

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: false,
            amount: 0.2,
          }}
          key={userType}
        >
          {steps.map((step) => {
            const IconComponent = step.icon;

            return (
              <motion.div
                key={step.id}
                variants={cardVariant}
                className="
                  flex
                  flex-col
                  rounded-md
                  border-2
                  border-gray-100
                  bg-white
                  px-6
                  py-10
                  text-center
                  shadow-sm
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-emerald-100
                  hover:shadow-md
                "
              >
                {/* ICON */}

                <div className="mb-5 flex justify-center">
                  <div
                    className="
                      rounded-full
                      bg-emerald-100
                      p-4
                      text-emerald-600
                    "
                  >
                    <IconComponent className="h-7 w-7" />
                  </div>
                </div>

                {/* STEP NUMBER */}

                <span className="text-sm font-bold text-emerald-600">
                  STEP {step.id}
                </span>

                {/* TITLE */}

                <h4 className="mt-2 text-lg font-bold text-gray-900">
                  {step.title}
                </h4>

                {/* DESCRIPTION */}

                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* =========================
            KAJOB GREEN BANNER
            ENTRANCE ANIMATION ONLY ONCE
        ========================= */}

        <motion.div
          className="
            mt-20
            overflow-hidden
            rounded-3xl
            bg-emerald-600
            shadow-lg
            transition-shadow
            duration-300
            hover:shadow-[0_15px_40px_rgba(16,185,129,0.35)]
          "
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          whileHover={{
            y: -6,
            scale: 1.01,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className="grid min-h-[500px] md:grid-cols-2">

            {/* =========================
                LEFT SIDE
            ========================= */}

            <div
              className="
                flex
                flex-col
                justify-center
                px-8
                py-14
                md:px-14
                lg:px-16
              "
            >
              {/* BRAND */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="mb-10"
              >
                <span className="text-3xl font-bold tracking-tight text-white">
                  KaJob.
                </span>
              </motion.div>

              {/* HEADLINE */}

              <motion.h2
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                }}
                className="
                  max-w-xl
                  text-4xl
                  font-semibold
                  leading-tight
                  text-white
                  md:text-5xl
                "
              >
                {userType === "client"
                  ? "Hire locally. Get things done."
                  : "Work locally. Earn more."}
              </motion.h2>

              {/* DESCRIPTION */}

              <motion.p
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.15,
                }}
                className="
                  mt-7
                  max-w-lg
                  text-base
                  leading-7
                  text-white/85
                  md:text-lg
                "
              >
                {userType === "client"
                  ? "KaJob makes it easy to find, hire, and work with talented professionals in your community."
                  : "KaJob makes it easy to discover nearby opportunities, connect with clients, and earn from your skills."}
              </motion.p>

              {/* BUTTON */}

              <motion.button
                type="button"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
                className="
                  mt-9
                  w-fit
                  rounded-lg
                  bg-white
                  px-8
                  py-4
                  font-semibold
                  text-emerald-600
                  shadow-lg
                  transition
                  duration-300
                  hover:scale-105
                  hover:shadow-xl
                "
              >
                {userType === "client"
                  ? "Find a Worker"
                  : "Find Work"}
              </motion.button>

              {/* TRUST MESSAGE */}

              <motion.div
                initial={{
                  opacity: 0,
                }}
                whileInView={{
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                }}
                className="mt-8 flex items-center gap-3"
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                  "
                >
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>

                <span className="text-sm font-semibold text-white">
                  Built for your community
                </span>
              </motion.div>
            </div>

            {/* =========================
                RIGHT SIDE
            ========================= */}

            <div
              className="
                relative
                flex
                min-h-[400px]
                items-center
                justify-center
                overflow-hidden
                px-8
                py-12
              "
            >
              {/* DECORATIVE CIRCLES */}

              <div
                className="
                  absolute
                  right-[-80px]
                  top-[-80px]
                  h-64
                  w-64
                  rounded-full
                  bg-white/5
                "
              />

              <div
                className="
                  absolute
                  bottom-[-100px]
                  left-[-80px]
                  h-72
                  w-72
                  rounded-full
                  bg-white/5
                "
              />

              {/* THREE DOTS */}

              <motion.div
                animate={{
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  right-1/2
                  top-12
                  z-20
                  flex
                  -translate-x-1/2
                  gap-2
                  rounded-full
                  border
                  border-white/20
                  bg-white/10
                  px-7
                  py-4
                  backdrop-blur-sm
                "
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white" />
              </motion.div>

              {/* BACK CARD */}

              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  right-[12%]
                  h-[300px]
                  w-[190px]
                  rotate-6
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-sm
                "
              >
                <div className="flex h-full flex-col items-center justify-end pb-8">
                  <UserGroupIcon className="h-10 w-10 text-white/50" />

                  <span className="mt-3 text-sm text-white/60">
                    Local Professionals
                  </span>
                </div>
              </motion.div>

              {/* LEFT CARD */}

              <motion.div
                animate={{
                  y: [10, 0, 10],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  left-[8%]
                  h-[280px]
                  w-[180px]
                  -rotate-6
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-sm
                "
              >
                <div className="flex h-full flex-col items-center justify-end pb-8">
                  <MagnifyingGlassIcon className="h-10 w-10 text-white/50" />

                  <span className="mt-3 text-sm text-white/60">
                    Nearby Jobs
                  </span>
                </div>
              </motion.div>

              {/* FRONT CARD */}

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="
                  relative
                  z-10
                  h-[340px]
                  w-[220px]
                  rounded-2xl
                  border
                  border-white/30
                  bg-white/15
                  p-5
                  shadow-2xl
                  backdrop-blur-md
                "
              >
                <div
                  className="
                    flex
                    h-full
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-full
                      bg-white/15
                    "
                  >
                    <SparklesIcon className="h-10 w-10 text-white" />
                  </div>

                  {/* TITLE */}

                  <h3 className="mt-6 text-2xl font-bold text-white">
                    KaJob
                  </h3>

                  {/* DESCRIPTION */}

                  <p className="mt-2 text-sm text-white/70">
                    {userType === "client"
                      ? "Find the right worker for your task"
                      : "Find opportunities near you"}
                  </p>

                  {/* STATUS */}

                  <div
                    className="
                      mt-8
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-white/10
                      px-4
                      py-2
                    "
                  >
                    <CheckCircleIcon className="h-5 w-5 text-white" />

                    <span className="text-xs font-medium text-white">
                      Ready to connect
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;