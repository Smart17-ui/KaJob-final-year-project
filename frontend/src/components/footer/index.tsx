import Logo from "@/assets/Logo.png";

import {
  GlobeAltIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-5/6 max-w-7xl py-8">

        {/* =========================
            MAIN FOOTER
        ========================= */}

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          {/* =========================
              LOGO & COPYRIGHT
          ========================= */}

          <div className="flex flex-col items-center gap-3 md:flex-row">
            <img
              src={Logo}
              alt="KaJob logo"
              className="h-10 w-auto object-contain"
            />

            <p className="text-center text-sm text-gray-600 md:text-left">
              © KaJob International Ltd. {currentYear}
            </p>
          </div>

          {/* =========================
              SOCIAL MEDIA
          ========================= */}

          <div className="flex items-center gap-5">

            {/* Facebook */}

            <button
              type="button"
              aria-label="Facebook"
              className="text-sm text-gray-600 transition duration-300 hover:text-primary-500"
            >
              Facebook
            </button>

            {/* Instagram */}

            <button
              type="button"
              aria-label="Instagram"
              className="text-sm text-gray-600 transition duration-300 hover:text-primary-500"
            >
              Instagram
            </button>

            {/* LinkedIn */}

            <button
              type="button"
              aria-label="LinkedIn"
              className="text-sm text-gray-600 transition duration-300 hover:text-primary-500"
            >
              LinkedIn
            </button>

            {/* TikTok */}

            <button
              type="button"
              aria-label="TikTok"
              className="text-sm text-gray-600 transition duration-300 hover:text-primary-500"
            >
              TikTok
            </button>
          </div>
        </div>

        {/* =========================
            DIVIDER
        ========================= */}

        <div className="my-6 h-px w-full bg-gray-200" />

        {/* =========================
            BOTTOM SECTION
        ========================= */}

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          {/* Links */}

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">

            <a
              href="#about"
              className="transition duration-300 hover:text-primary-500"
            >
              About
            </a>

            <a
              href="#how-it-works"
              className="transition duration-300 hover:text-primary-500"
            >
              How It Works
            </a>

            <a
              href="#contact-us"
              className="transition duration-300 hover:text-primary-500"
            >
              Contact Us
            </a>

            <a
              href="#"
              className="transition duration-300 hover:text-primary-500"
            >
              Terms
            </a>

            <a
              href="#"
              className="transition duration-300 hover:text-primary-500"
            >
              Privacy
            </a>
          </div>

          {/* =========================
              SETTINGS
          ========================= */}

          <div className="flex items-center gap-5">

            {/* Language */}

            <button
              type="button"
              className="flex items-center gap-2 text-sm text-gray-600 transition duration-300 hover:text-primary-500"
            >
              <GlobeAltIcon className="h-5 w-5" />

              <span>English</span>
            </button>

            {/* Currency */}

            <button
              type="button"
              className="text-sm text-gray-600 transition duration-300 hover:text-primary-500"
            >
              ZMW
            </button>

            {/* Help */}

            <button
              type="button"
              aria-label="Help"
              className="rounded-full p-1 text-gray-600 transition duration-300 hover:bg-gray-100 hover:text-primary-500"
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;