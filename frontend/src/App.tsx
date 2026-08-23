import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "@/components/navbar";
import Home from "@/components/home";
import PostJob from "@/components/postJob";
import Services from "@/components/services";
import Footer from "@/components/footer";
import FindWork from "@/components/findwork";

import Login from "@/pages/logIn";
import Register from "@/pages/register";

import { SelectedPage } from "@/shared/types";

function HomePage({
  selectedPage,
  setSelectedPage,
}: {
  selectedPage: SelectedPage;
  setSelectedPage: (value: SelectedPage) => void;
}) {
  return (
    <>
      <Home setSelectedPage={setSelectedPage} />
      <Services setSelectedPage={setSelectedPage} />
      <FindWork setSelectedPage={setSelectedPage} />
      <PostJob setSelectedPage={setSelectedPage} />
      <Footer />
    </>
  );
}

function App() {
  const [selectedPage, setSelectedPage] = useState<SelectedPage>(
    SelectedPage.Home
  );

  const [isTopOfPage, setIsTopOfPage] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setIsTopOfPage(true);
        setSelectedPage(SelectedPage.Home);
      } else {
        setIsTopOfPage(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="app bg-gray-20 min-h-screen">
      <Navbar
        isTopOfPage={isTopOfPage}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
      />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <HomePage
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
            />
          }
        />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;