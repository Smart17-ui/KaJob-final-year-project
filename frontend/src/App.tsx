import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "@/components/navbar";
import Home from "@/components/home";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/about";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/footer";

import Login from "@/pages/logIn";
import Register from "@/pages/register";

import { SelectedPage } from "@/shared/types";

/* =========================
   LANDING PAGE
========================= */

type HomePageProps = {
  selectedPage: SelectedPage;
  setSelectedPage: (
    value: SelectedPage
  ) => void;
};

const HomePage = ({
  selectedPage,
  setSelectedPage,
}: HomePageProps) => {
  return (
    <>
      <Home
        setSelectedPage={setSelectedPage}
      />

      <HowItWorks
        setSelectedPage={setSelectedPage}
      />

      <About
        setSelectedPage={setSelectedPage}
      />

      <ContactUs
        setSelectedPage={setSelectedPage}
      />

      <Footer />
    </>
  );
};

/* =========================
   APP
========================= */

function App() {
  const [selectedPage, setSelectedPage] =
    useState<SelectedPage>(
      SelectedPage.Home
    );

  const [isTopOfPage, setIsTopOfPage] =
    useState(true);

  /* =========================
     SCROLL DETECTION
  ========================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsTopOfPage(
        window.scrollY === 0
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="app min-h-screen bg-gray-20">

      <Navbar
        isTopOfPage={isTopOfPage}
        selectedPage={selectedPage}
        setSelectedPage={
          setSelectedPage
        }
      />

      <Routes>

        {/* LANDING PAGE */}

        <Route
          path="/"
          element={
            <HomePage
              selectedPage={
                selectedPage
              }
              setSelectedPage={
                setSelectedPage
              }
            />
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

      </Routes>

    </div>
  );
}

export default App;