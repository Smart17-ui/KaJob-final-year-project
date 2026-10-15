// frontend/src/components/verification/VerificationGate.tsx

import type { ReactNode } from "react";

import { useVerification } from "@/hooks/useVerification";
import StartVerificationCard from "./StartVerificationCard";
import UnderReviewCard from "./UnderReviewCard";
import RejectedCard from "./RejectedCard";

type VerificationGateProps = {
  role: "CLIENT" | "WORKER";
  children: ReactNode;
};

const VerificationGate = ({ role, children }: VerificationGateProps) => {
  const { loading, verified, status } = useVerification();

  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  /* ---------------------------------------------------------
     VERIFIED — render the real dashboard
  --------------------------------------------------------- */
  if (verified) {
    return <>{children}</>;
  }

  /* ---------------------------------------------------------
     NOT VERIFIED — pick a card by state
  --------------------------------------------------------- */
  const verificationStatus = status?.verification_status ?? "NOT_SUBMITTED";

  switch (verificationStatus) {
    case "UNDER_REVIEW":
      return <UnderReviewCard role={role} status={status} />;

    case "REJECTED":
      return <RejectedCard role={role} status={status} />;

    // NOT_SUBMITTED, PENDING, EXPIRED (or anything else) all go here
    default:
      return <StartVerificationCard role={role} status={status} />;
  }
};

export default VerificationGate;
