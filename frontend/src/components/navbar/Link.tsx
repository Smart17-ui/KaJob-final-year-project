import AnchorLink from "react-anchor-link-smooth-scroll";

import { SelectedPage } from "@/shared/types";

type Props = {
  page: SelectedPage;
  selectedPage: SelectedPage;
  setSelectedPage: (value: SelectedPage) => void;
  onNavigate?: () => void;
  className?: string;
  mobile?: boolean;
};

const Link = ({
  page,
  selectedPage,
  setSelectedPage,
  onNavigate,
  className = "",
  mobile = false,
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

  const isSelected = selectedPage === page;

  return (
    <AnchorLink
      href={`#${linkId}`}
      aria-current={isSelected ? "page" : undefined}
      onClick={() => {
        setSelectedPage(page);
        onNavigate?.();
      }}
      className={`${
        mobile
          ? "group flex items-center gap-3 font-normal text-slate-700 transition-colors duration-300 ease-in-out hover:text-slate-950"
          : "group inline-flex flex-col items-stretch font-normal text-slate-700 transition-colors duration-300 ease-in-out hover:text-slate-950"
      } cursor-pointer ${className}`}
    >
      {mobile && (
        <span
          aria-hidden="true"
          className={`h-5 w-[3px] flex-shrink-0 origin-center rounded-full bg-slate-700 transition-transform duration-300 ease-in-out ${
            isSelected ? "scale-y-100" : "scale-y-0"
          }`}
        />
      )}

      <span className={mobile ? "inline-block" : "inline-block text-center"}>
        {page === SelectedPage.HowItWorks
          ? "How It Works"
          : page === SelectedPage.ContactUs
          ? "Contact Us"
          : page === SelectedPage.Home
          ? "Home"
          : "About"}
      </span>

      {!mobile && (
        <span
          aria-hidden="true"
          className={`mt-1 block h-[3px] w-full origin-left rounded-full bg-slate-700 transition-transform duration-300 ease-in-out ${
            isSelected ? "scale-x-100" : "scale-x-0"
          }`}
        />
      )}
    </AnchorLink>
  );
};

export default Link;
