import { useEffect, useState } from "react";

import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Logo from "@/assets/Logo.png";

import Link from "./Link";

import { SelectedPage } from "@/shared/types";

import useMediaQuery from "@/hooks/useMediaQuery";

import ActionButton from "@/shared/ActionButton";

import {
  clearAuth,
  isAuthenticated,
} from "@/shared/auth";

type Props = {
  isTopOfPage: boolean;
  selectedPage: SelectedPage;
  setSelectedPage: (
    value: SelectedPage
  ) => void;
};

const Navbar = ({
  isTopOfPage,
  selectedPage,
  setSelectedPage,
}: Props) => {
  const [isMenuToggled, setIsMenuToggled] =
    useState(false);

  const [authenticated, setAuthenticated] =
    useState(false);

  const isAboveMediumScreens =
    useMediaQuery("(min-width: 1060px)");

  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
     CHECK AUTHENTICATION
  ========================= */

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, [location]);

  /* =========================
     AUTH PAGES
  ========================= */

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  /* =========================
     NAVBAR BACKGROUND
  ========================= */

  const navbarBackground = isAuthPage
    ? "bg-transparent"
    : !isTopOfPage
    ? "bg-white drop-shadow"
    : "";

  /* =========================
     LOGOUT
  ========================= */

  function handleLogout() {
    clearAuth();

    setAuthenticated(false);

    setIsMenuToggled(false);
  }

  /* =========================
     GO TO LOGIN
  ========================= */

  function handleLogin() {
    setIsMenuToggled(false);
    navigate("/login");
  }

  /* =========================
     GO TO REGISTER
  ========================= */

  function handleRegister() {
    setIsMenuToggled(false);
    navigate("/register");
  }

  return (
    <nav>
      {/* =========================
          NAVBAR
      ========================= */}

      <div
        className={`${navbarBackground} fixed top-0 z-30 h-[60px] w-full`}
      >
        <div className="mx-auto flex h-full w-[92%] items-center">

          {/* =========================
              LOGO
          ========================= */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="h-[55px] w-fit flex-shrink-0"
            aria-label="Go to KaJob homepage"
          >
            <img
              src={Logo}
              alt="KaJob"
              className="h-full w-auto object-contain"
            />
          </button>

          {/* =========================
              DESKTOP NAVIGATION
          ========================= */}

          {!isAuthPage && (
            <>
              {isAboveMediumScreens ? (
                <div className="flex flex-1 items-center">

                  {/* =========================
                      NAVIGATION LINKS
                  ========================= */}

                  <div className="ml-64 flex items-center gap-8 text-sm">

                    <Link
                      page={SelectedPage.Home}
                      selectedPage={selectedPage}
                      setSelectedPage={
                        setSelectedPage
                      }
                    />

                    <Link
                      page={
                        SelectedPage.HowItWorks
                      }
                      selectedPage={selectedPage}
                      setSelectedPage={
                        setSelectedPage
                      }
                    />

                    <Link
                      page={SelectedPage.About}
                      selectedPage={selectedPage}
                      setSelectedPage={
                        setSelectedPage
                      }
                    />

                    <Link
                      page={
                        SelectedPage.ContactUs
                      }
                      selectedPage={selectedPage}
                      setSelectedPage={
                        setSelectedPage
                      }
                    />
                  </div>

                  {/* =========================
                      AUTH BUTTONS
                  ========================= */}

                  <div className="ml-auto flex items-center gap-6">

                    {authenticated ? (
                      /* =========================
                         LOGGED IN
                      ========================= */

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="cursor-pointer transition duration-300 hover:text-green-900"
                      >
                        Log Out
                      </button>
                    ) : (
                      /* =========================
                         LOGGED OUT
                      */

                      <>
                        <button
                          type="button"
                          onClick={handleLogin}
                          className="cursor-pointer transition duration-300 hover:text-green-900"
                        >
                          Log In
                        </button>

                        <ActionButton
                          onClick={
                            handleRegister
                          }
                  
                        >
                          Create Account
                        </ActionButton>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* =========================
                   MOBILE MENU BUTTON
                ========================= */

                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="ml-auto rounded-full bg-secondary-600 p-2"
                  onClick={() =>
                    setIsMenuToggled(true)
                  }
                >
                  <Bars3Icon className="h-6 w-6 text-white" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}

      {!isAuthPage &&
        !isAboveMediumScreens &&
        isMenuToggled && (
          <div className="fixed bottom-0 right-0 z-40 h-full w-[300px] bg-primary-100 drop-shadow-xl">

            {/* =========================
                CLOSE BUTTON
            ========================= */}

            <div className="flex justify-end p-8">
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() =>
                  setIsMenuToggled(false)
                }
              >
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* =========================
                MOBILE LINKS
            ========================= */}

            <div className="ml-[33%] flex flex-col gap-10 text-2xl">

              <Link
                page={SelectedPage.Home}
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
              />

              <Link
                page={
                  SelectedPage.HowItWorks
                }
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
              />

              <Link
                page={SelectedPage.About}
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
              />

              <Link
                page={
                  SelectedPage.ContactUs
                }
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
              />

              {/* =========================
                  MOBILE AUTH BUTTONS
              ========================= */}

              {authenticated ? (
                /* LOGGED IN */

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left"
                >
                  Log Out
                </button>
              ) : (
                /* LOGGED OUT */

                <>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="text-left"
                  >
                    Log In
                  </button>

                  <button
                    type="button"
                    onClick={handleRegister}
                    className="text-left "
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        )}
    </nav>
  );
};

export default Navbar;
