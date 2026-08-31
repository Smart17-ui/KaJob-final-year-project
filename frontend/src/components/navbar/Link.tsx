import AnchorLink from "react-anchor-link-smooth-scroll";

import { SelectedPage } from "@/shared/types";

type Props = {
  page: SelectedPage;
  selectedPage: SelectedPage;
  setSelectedPage: (value: SelectedPage) => void;
};

const Link = ({
  page,
  selectedPage,
  setSelectedPage,
}: Props) => {
  /*
    Map the SelectedPage enum values
    to the IDs used by the landing-page sections.
  */
  const linkId = {
    [SelectedPage.Home]: "home",
    [SelectedPage.HowItWorks]: "how-it-works",
    [SelectedPage.About]: "about",
    [SelectedPage.ContactUs]: "contact-us",
  }[page];

  return (
    <AnchorLink
      href={`#${linkId}`}
      onClick={() => setSelectedPage(page)}
      className={`${
        selectedPage === page
          ? "text-secondary-600 font-bold"
          : "text-black font-bold"
      } cursor-pointer transition duration-500 hover:text-green-900`}
    >
      {page === SelectedPage.HowItWorks
        ? "How It Works"
        : page === SelectedPage.ContactUs
        ? "Contact Us"
        : page === SelectedPage.Home
        ? "Home"
        : "About"}
    </AnchorLink>
  );
};

export default Link;

