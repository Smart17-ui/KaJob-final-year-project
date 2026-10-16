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

  useEffect(() => {
    setIsMenuToggled(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuToggled) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuToggled(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuToggled]);

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
            onClick={() => {
              setIsMenuToggled(false);
              navigate("/");
            }}
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
                  aria-expanded={isMenuToggled}
                  aria-controls="mobile-navigation"
                  className="ml-auto rounded-full bg-secondary-600 p-2.5 shadow-md shadow-secondary-600/20 transition hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-300"
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
          <div className="fixed inset-0 z-50" role="presentation">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 h-full w-full bg-slate-950/40 backdrop-blur-[2px]"
              onClick={() => setIsMenuToggled(false)}
            />
            <aside
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="KaJob navigation"
              className="absolute right-0 top-0 flex h-full w-[min(88vw,380px)] flex-col border-l border-slate-100 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuToggled(false);
                    navigate("/");
                  }}
                  className="flex items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-300"
                  aria-label="KaJob home"
                >
                  <img src={Logo} alt="KaJob" className="h-10 w-auto object-contain" />
                </button>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMenuToggled(false)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Explore KaJob</p>
              </div>

              <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4 text-lg">

              <Link
                page={SelectedPage.Home}
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
                onNavigate={() => setIsMenuToggled(false)}
                className="rounded-xl px-4 py-3 text-base hover:bg-slate-50"
              />

              <Link
                page={
                  SelectedPage.HowItWorks
                }
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
                onNavigate={() => setIsMenuToggled(false)}
                className="rounded-xl px-4 py-3 text-base hover:bg-slate-50"
              />

              <Link
                page={SelectedPage.About}
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
                onNavigate={() => setIsMenuToggled(false)}
                className="rounded-xl px-4 py-3 text-base hover:bg-slate-50"
              />

              <Link
                page={
                  SelectedPage.ContactUs
                }
                selectedPage={selectedPage}
                setSelectedPage={
                  setSelectedPage
                }
                onNavigate={() => setIsMenuToggled(false)}
                className="rounded-xl px-4 py-3 text-base hover:bg-slate-50"
              />

              {/* =========================
                  MOBILE AUTH BUTTONS
              ========================= */}

              {authenticated ? (
                /* LOGGED IN */

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 rounded-xl px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Log Out
                </button>
              ) : (
                /* LOGGED OUT */

                <>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-4 rounded-xl px-4 py-3 text-left font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Log In
                  </button>

                  <button
                    type="button"
                    onClick={handleRegister}
                    className="rounded-xl bg-secondary-600 px-4 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-secondary-700"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>
              <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 text-xs text-slate-500">
                Local work. Trusted connections.
              </div>
            </aside>
          </div>
        )}
    </nav>
  );
};

export default Navbar;
