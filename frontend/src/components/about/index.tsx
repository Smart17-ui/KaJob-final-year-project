"use client";

import { FC } from "react";
import { motion } from "framer-motion";

import {
  MapPinIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

import AboutImage from "@/assets/AboutImage.jpg";
import { SelectedPage } from "@/shared/types";

interface Props {
  setSelectedPage: (value: SelectedPage) => void;
}

const About: FC<Props> = ({ setSelectedPage }) => {
  const features = [
    {
      icon: MapPinIcon,
      title: "Local Opportunities",
      description:
        "Find piecework and workers in your local area using location-based matching.",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100/50",
    },
    {
      icon: UserGroupIcon,
      title: "Connect Easily",
      description:
        "KaJob brings clients and workers together on one simple platform.",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100/50",
    },
    {
      icon: ShieldCheckIcon,
      title: "Build Trust",
      description:
        "Ratings and reviews help users make informed decisions when working together.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100/50",
    },
    {
      icon: BoltIcon,
      title: "Simple & Fast",
      description:
        "Discover opportunities, apply for work, and connect with clients without unnecessary complexity.",
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100/50",
    },
  ];

  // =========================
  // FEATURE CARD ANIMATION
  // =========================

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
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

  return (
    <motion.section
      id="about"
      className="relative w-full overflow-hidden scroll-mt-0 bg-gradient-to-b from-white via-primary-50/20 to-white pb-2 pt-20 md:pb-3 md:pt-24"
      onViewportEnter={() => setSelectedPage(SelectedPage.About)}
      viewport={{
        amount: 0.2,
      }}
    >
      {/* ====================
          DECORATIVE BACKGROUND
      ==================== */}

      <div className="absolute right-0 top-20 -z-10 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />

      <div className="absolute bottom-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary-100/20 blur-3xl" />

      <div className="mx-auto w-[90%] max-w-7xl">

        {/* ====================
            HEADER
        ==================== */}

        <motion.div
          className="mx-auto mb-14 text-center md:mb-16"
          initial={{
            opacity: 0,
            y: -30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            amount: 0.4,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Connecting Local
            <br />

            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600 md:mt-6">
            KaJob is redefining how people find local work and hire reliable
            workers. We believe the best opportunities are right in your
            community.
          </p>
        </motion.div>

        {/* ====================
            MAIN CONTENT
        ==================== */}

        <div className="mb-8 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">

          {/* ====================
              IMAGE SIDE
          ==================== */}

          <motion.div
            className="relative"
            initial={{
              opacity: 0,
              x: -50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              amount: 0.25,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-primary-400/20 to-primary-200/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              <img
                src={AboutImage}
                alt="People connecting through KaJob"
                className="aspect-square w-full object-cover md:aspect-auto"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-5 left-5 rounded-xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur md:bottom-6 md:left-6"
              >
                <p className="mt-0.5 text-xs text-gray-600">
                  growing every day
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ====================
              TEXT SIDE
          ==================== */}

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
              amount: 0.25,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="space-y-8"
          >

            {/* HEADING + DESCRIPTION */}

            <div>
              <h3 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Making Local Work Easier
              </h3>

              <p className="mt-5 text-lg leading-relaxed text-gray-600">
                Finding reliable piecework or a suitable worker shouldn't be
                difficult. KaJob simplifies the process by using location-based
                matching to connect workers with nearby opportunities and
                clients with available talent.
              </p>
            </div>

            {/* ====================
                VALUE PROPOSITIONS
            ==================== */}

            <div className="space-y-4">
              {[
                "Access opportunities right in your neighborhood",
                "Get matched with qualified workers or clients instantly",
                "Build your reputation through verified ratings",
                "Complete transactions safely and securely",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    amount: 0.5,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-primary-600" />
                  </div>

                  <span className="text-base leading-6 text-gray-700">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ====================
                CTA
            ==================== */}

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Explore Opportunities

              <ArrowRightIcon className="h-5 w-5" />
            </motion.button>

          </motion.div>
        </div>

        {/* ====================
            FEATURES GRID
        ==================== */}

        <div>

          <motion.h3
            className="mb-10 text-center text-3xl font-bold text-gray-900 md:mb-12"
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              amount: 0.5,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            Why Choose KaJob
          </motion.h3>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              amount: 0.2,
            }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition-shadow duration-300 hover:shadow-xl"
                >

                  {/* BACKGROUND GRADIENT */}

                  <div
                    className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.bgColor} opacity-0 transition duration-300 group-hover:opacity-100`}
                  />

                  {/* TOP ACCENT */}

                  <div
                    className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${feature.color}`}
                  />

                  {/* ICON */}

                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className={`mb-5 inline-flex rounded-lg bg-gradient-to-br ${feature.bgColor} p-3`}
                  >
                    <Icon className="h-6 w-6 text-primary-600" />
                  </motion.div>

                  {/* CONTENT */}

                  <h4 className="mb-2 text-lg font-bold text-gray-900">
                    {feature.title}
                  </h4>

                  <p className="text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>

                  {/* BOTTOM ACCENT */}

                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary-500 to-transparent transition-all duration-300 group-hover:w-full" />

                </motion.div>
              );
            })}
          </motion.div>

        </div>

      </div>
    </motion.section>
  );
};

export default About;