import { SelectedPage } from "@/shared/types";
import HomePageGraphic from "@/assets/HomePageGraphic.png";
import Sparkles from "@/assets/Sparkles.png";
import AnchorLink from "react-anchor-link-smooth-scroll";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { ArrowRightIcon } from "@heroicons/react/24/solid";

type Props = {
  setSelectedPage: (value: SelectedPage) => void;
};

const Home = ({ setSelectedPage }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden">

      {/* =========================
          DECORATIVE BACKGROUND
      ========================= */}

      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />

      <div className="absolute -bottom-20 left-1/3 -z-10 h-96 w-96 rounded-full bg-primary-100/30 blur-3xl" />

      <div className="absolute top-1/2 right-1/4 -z-10 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />

      {/* =========================
          HOME SECTION
      ========================= */}

      <section
        id="home"
        className="relative w-full bg-gradient-to-b from-white via-primary-50/30 to-white px-4 py-12 md:px-10 md:py-20"
      >
        <motion.div
          className="mx-auto max-w-7xl"
          onViewportEnter={() =>
            setSelectedPage(SelectedPage.Home)
          }
        >

          {/* =========================
              HERO GRID
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
                amount: 0.3,
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
              }}
              className="space-y-8"
            >

              {/* =========================
                  MAIN HEADLINE
              ========================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: -20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: false,
                  amount: 0.3,
                }}
                transition={{
                  delay: 0.1,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >

                {/* Heading + Sparkles */}

                <div className="relative">

                  <h1 className="text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                    Find Work.
                    <br />

                    <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-blue-500 bg-clip-text text-transparent">
                      Hire Talent.
                    </span>

                    <br />

                    Locally.
                  </h1>

                  {/* =========================
                      FLOATING SPARKLES
                  ========================= */}

                  <motion.img
                    src={Sparkles}
                    alt=""
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="
                      absolute
                      bottom-0
                      right-[30%]
                      h-12
                      w-12
                      object-contain
                      md:right-[35%]
                      md:h-16
                      md:w-16
                    "
                  />

                </div>

                {/* =========================
                    DESCRIPTION
                ========================= */}

                <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
                  Connect with skilled workers or find opportunities in your
                  neighborhood. KaJob makes local piecework easier, faster,
                  and more reliable.
                </p>

              </motion.div>

              {/* =========================
                  CTA BUTTONS
              ========================= */}

              <motion.div
                className="flex flex-col gap-4 sm:flex-row sm:gap-6"
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
                  amount: 0.3,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >

                {/* =========================
                    GET STARTED
                ========================= */}

                <button
                  onClick={() => navigate("/register")}
                  className="
                    group
                    relative
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-gradient-to-r
                    from-secondary-500
                    to-secondary-700
                    px-8
                    py-4
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-secondary-500/25
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:from-secondary-600
                    hover:to-secondary-800
                    hover:shadow-xl
                    hover:shadow-secondary-500/30
                    active:scale-95
                  "
                >
                  <span>Get Started</span>

                  <ArrowRightIcon
                    className="
                      h-5
                      w-5
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </button>

                {/* =========================
                    LEARN HOW IT WORKS
                ========================= */}

                <AnchorLink
                  href="#how-it-works"
                  onClick={() =>
                    setSelectedPage(SelectedPage.HowItWorks)
                  }
                  className="
                    group
                    relative
                    inline-flex
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-gradient-to-r
                    from-secondary-500
                    to-secondary-700
                    px-8
                    py-4
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-secondary-500/25
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:from-secondary-600
                    hover:to-secondary-800
                    hover:shadow-xl
                    hover:shadow-secondary-500/30
                    active:scale-95
                  "
                >
                  <span>Learn How It Works</span>

                  <ArrowRightIcon
                    className="
                      h-5
                      w-5
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </AnchorLink>

              </motion.div>

            </motion.div>

            {/* =========================
                RIGHT SIDE - GRAPHIC
            ========================= */}

            <motion.div
              className="relative"
              initial={{
                opacity: 0,
                scale: 0.9,
                x: 50,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
                x: 0,
              }}
              viewport={{
                once: false,
                amount: 0.3,
              }}
              transition={{
                delay: 0.15,
                duration: 0.7,
                ease: "easeOut",
              }}
            >

              {/* =========================
                  ROTATING CIRCLES
              ========================= */}

              <div className="absolute inset-0 flex items-center justify-center">

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute
                    h-96
                    w-96
                    rounded-full
                    border-2
                    border-primary-200/30
                  "
                />

                <motion.div
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    absolute
                    h-80
                    w-80
                    rounded-full
                    border-2
                    border-primary-100/30
                  "
                />

              </div>

              {/* =========================
                  MAIN GRAPHIC
              ========================= */}

              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >

                <img
                  className="
                    h-auto
                    w-full
                    max-w-md
                    object-contain
                    drop-shadow-2xl
                  "
                  alt="KaJob hero graphic"
                  src={HomePageGraphic}
                />

              </motion.div>

            </motion.div>

          </div>

        </motion.div>

      </section>

    </div>
  );
};

export default Home;