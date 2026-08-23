import { FC } from "react";
import { motion } from "framer-motion";

import {
  UserCircleIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  DocumentCheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

import ServiceCard, {
  ServiceCardProps,
} from "@/components/services/ServiceCard";

import { SelectedPage } from "@/shared/types";

interface Props {
  setSelectedPage: (value: SelectedPage) => void;
}

/* =========================
   SERVICE CONFIGURATION
========================= */

const SERVICE_CONFIGURATION = {
  common: [
    {
      title: "My Profile",
      icon: UserCircleIcon,
      path: "/profile",
    },
    {
      title: "Messages",
      icon: EnvelopeIcon,
      path: "/messages",
    },
    {
      title: "Applications",
      icon: DocumentCheckIcon,
      path: "/applications",
    },
    {
      title: "Settings",
      icon: Cog6ToothIcon,
      path: "/settings",
    },
    {
      title: "Help & Support",
      icon: QuestionMarkCircleIcon,
      path: "/help",
    },
  ] as ServiceCardProps[],

  worker: [
    {
      title: "Find Work",
      icon: MagnifyingGlassIcon,
      path: "/jobs",
    },
  ] as ServiceCardProps[],

  client: [
    {
      title: "Post Job",
      icon: PlusIcon,
      path: "/post-job",
    },
    {
      title: "My Jobs",
      icon: FolderIcon,
      path: "/jobs/posted",
    },
  ] as ServiceCardProps[],
};

/* =========================
   SERVICES COMPONENT
========================= */

const Services: FC<Props> = ({ setSelectedPage }) => {
  /*
   * Temporary values.
   *
   * Later replace these with:
   *
   * const { user } = useAuth();
   * const isWorker = user?.is_worker ?? false;
   * const isClient = user?.is_client ?? false;
   */

  const isWorker = true;
  const isClient = true;

  /*
   * Build services based on roles.
   *
   * Worker + Client = all 8 cards.
   */

  const services: ServiceCardProps[] = [
    ...SERVICE_CONFIGURATION.common,

    ...(isWorker ? SERVICE_CONFIGURATION.worker : []),

    ...(isClient ? SERVICE_CONFIGURATION.client : []),
  ];

  /* =========================
     FRAMER MOTION
  ========================= */

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
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
    /*
     * IMPORTANT:
     * Keep id="services".
     *
     * Your Navbar uses this ID
     * to scroll to this section.
     */

    <section
      id="services"
      className="
        min-h-screen
        w-full
        bg-gray-50
        py-20
      "
    >
      <motion.div
        onViewportEnter={() =>
          setSelectedPage(SelectedPage.Services)
        }
        viewport={{
          once: true,
          amount: 0.2,
        }}
        className="
          mx-auto
          flex
          min-h-[calc(100vh-80px)]
          w-[90%]
          max-w-6xl
          flex-col
          justify-center
        "
      >
        {/* =========================
            HEADER
        ========================= */}

        <motion.div
          className="mb-8 text-center"
          initial={{
            opacity: 0,
            y: -20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.5,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            KaJob Services
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
            Everything you need to find work, manage jobs,
            and manage your KaJob account.
          </p>
        </motion.div>

        {/* =========================
            SERVICE CARDS
        ========================= */}

        <motion.div
          className="
            grid
            grid-cols-2
            gap-3
            sm:gap-4
            md:grid-cols-4
            md:gap-5
          "
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1,
          }}
        >
          {services.map((service) => (
            <motion.div
              key={service.path}
              variants={itemVariants}
              className="h-28 sm:h-32"
            >
              <ServiceCard
                title={service.title}
                icon={service.icon}
                path={service.path}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Services;