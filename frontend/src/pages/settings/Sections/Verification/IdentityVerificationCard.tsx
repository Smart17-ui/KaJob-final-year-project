import { ChangeEvent, useEffect, useMemo, useState } from "react";

import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

import type {
  VerificationDocumentType,
  VerificationStatusResponse,
} from "@/api/verification";

import {
  submitVerification,
  uploadVerificationDocument,
} from "@/api/verification";

type IdentityVerificationCardProps = {
  verification: VerificationStatusResponse;
  onVerificationUpdated?: () => Promise<void> | void;
};

type IdentityType = "NRC" | "PASSPORT";

type DocumentUploadState = {
  file: File | null;
  uploaded: boolean;
  uploading: boolean;
  error: string;
  fileName: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const createUploadState = (): DocumentUploadState => ({
  file: null,
  uploaded: false,
  uploading: false,
  error: "",
  fileName: "",
});

const IdentityVerificationCard = ({
  verification,
  onVerificationUpdated,
}: IdentityVerificationCardProps) => {
  const [identityType, setIdentityType] =
    useState<IdentityType>("NRC");

  const [documentNumber, setDocumentNumber] =
    useState(verification.document_number || "");

  const [front, setFront] = useState<DocumentUploadState>(
    createUploadState()
  );

  const [back, setBack] = useState<DocumentUploadState>(
    createUploadState()
  );

  const [passport, setPassport] =
    useState<DocumentUploadState>(createUploadState());

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const status =
    verification.verification_status || "NOT_SUBMITTED";

  const isUnderReview =
    status === "UNDER_REVIEW";

  const isVerified =
    status === "VERIFIED";

  const isPending =
    status === "PENDING";

  const isRejected =
    status === "REJECTED";

  const isExpired =
    status === "EXPIRED";

  useEffect(() => {
    setDocumentNumber(
      verification.document_number || ""
    );
  }, [verification.document_number]);

  useEffect(() => {
    const backendDocumentType =
      verification.document_type;

    if (
      backendDocumentType === "NRC_FRONT" ||
      backendDocumentType === "NRC_BACK"
    ) {
      setIdentityType("NRC");
    }

    if (
      backendDocumentType === "PASSPORT_PHOTO"
    ) {
      setIdentityType("PASSPORT");
    }
  }, [verification.document_type]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "VERIFIED":
        return "Verified";

      case "UNDER_REVIEW":
        return "Under review";

      case "PENDING":
        return "Pending";

      case "REJECTED":
        return "Rejected";

      case "EXPIRED":
        return "Expired";

      default:
        return "Not submitted";
    }
  }, [status]);

  const validateFile = (
    file: File
  ): string | null => {
    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 10 MB.";
    }

    const extension =
      file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG.";
    }

    if (
      file.type &&
      !allowedMimeTypes.includes(file.type)
    ) {
      return "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG.";
    }

    return null;
  };

  const handleIdentityTypeChange = (
    type: IdentityType
  ) => {
    if (
      isUnderReview ||
      isVerified
    ) {
      return;
    }

    setIdentityType(type);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    documentType: VerificationDocumentType
  ) => {
    const file = event.target.files?.[0] || null;

    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      updateUploadState(
        documentType,
        {
          file: null,
          uploaded: false,
          uploading: false,
          error: validationError,
          fileName: "",
        }
      );

      return;
    }

    updateUploadState(
      documentType,
      {
        file,
        uploaded: false,
        uploading: false,
        error: "",
        fileName: file.name,
      }
    );

    setError("");
    setSuccess("");
  };

  const updateUploadState = (
    documentType: VerificationDocumentType,
    state: Partial<DocumentUploadState>
  ) => {
    if (documentType === "NRC_FRONT") {
      setFront((current) => ({
        ...current,
        ...state,
      }));
      return;
    }

    if (documentType === "NRC_BACK") {
      setBack((current) => ({
        ...current,
        ...state,
      }));
      return;
    }

    if (documentType === "PASSPORT_PHOTO") {
      setPassport((current) => ({
        ...current,
        ...state,
      }));
    }
  };

  const getUploadState = (
    documentType: VerificationDocumentType
  ): DocumentUploadState => {
    if (documentType === "NRC_FRONT") {
      return front;
    }

    if (documentType === "NRC_BACK") {
      return back;
    }

    return passport;
  };

  const handleUpload = async (
    documentType: VerificationDocumentType
  ) => {
    const uploadState =
      getUploadState(documentType);

    if (!uploadState.file) {
      updateUploadState(
        documentType,
        {
          error: "Please select a file first.",
        }
      );

      return;
    }

    updateUploadState(
      documentType,
      {
        uploading: true,
        error: "",
      }
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await uploadVerificationDocument(
          documentType,
          uploadState.file
        );

      updateUploadState(
        documentType,
        {
          uploaded: true,
          uploading: false,
          error: "",
          fileName:
            response.document.file_name ||
            uploadState.file.name,
        }
      );

      setSuccess(
        response.message ||
          "Document uploaded successfully."
      );
    } catch (err) {
      updateUploadState(
        documentType,
        {
          uploaded: false,
          uploading: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to upload document.",
        }
      );
    }
  };

  const validateDocumentNumber = (): string | null => {
    const value =
      documentNumber.trim();

    if (!value) {
      return "Document number is required.";
    }

    if (identityType === "NRC") {
      if (
        !/^\d{6}\/\d{2}\/\d{1}$/.test(value)
      ) {
        return (
          "Invalid NRC format. Expected: 123456/78/1"
        );
      }
    }

    if (identityType === "PASSPORT") {
      if (
        !/^[A-Z]{2}\d{6}$/.test(value)
      ) {
        return (
          "Invalid Passport format. Expected: ZA123456"
        );
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const documentError =
      validateDocumentNumber();

    if (documentError) {
      setError(documentError);
      return;
    }

    if (identityType === "NRC") {
      if (!front.uploaded) {
        setError(
          "Please upload the front of your NRC."
        );
        return;
      }

      if (!back.uploaded) {
        setError(
          "Please upload the back of your NRC."
        );
        return;
      }
    }

    if (identityType === "PASSPORT") {
      if (!passport.uploaded) {
        setError(
          "Please upload your passport photo."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const documentType: VerificationDocumentType =
        identityType === "NRC"
          ? "NRC_FRONT"
          : "PASSPORT_PHOTO";

      const response =
        await submitVerification(
          documentType,
          documentNumber.trim()
        );

      setSuccess(
        response.message ||
          "Your identity verification has been submitted for review."
      );

      await onVerificationUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit identity verification."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusIcon = () => {
    if (isVerified) {
      return (
        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
      );
    }

    if (isUnderReview || isPending) {
      return (
        <ClockIcon className="h-5 w-5 text-amber-600" />
      );
    }

    if (isRejected) {
      return (
        <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
      );
    }

    return (
      <IdentificationIcon className="h-5 w-5 text-slate-500" />
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <IdentificationIcon className="h-5 w-5 text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Identity verification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Verify your identity by submitting an accepted identity document.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {renderStatusIcon()}

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : isUnderReview || isPending
                    ? "bg-amber-50 text-amber-700"
                    : isRejected
                    ? "bg-red-50 text-red-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {isVerified && (
            <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Your identity is verified
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Your submitted identity information has been approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isUnderReview && (
            <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Your identity is under review
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Your documents have been submitted and are waiting for admin review.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Documents are pending
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Continue completing your identity verification below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Verification was rejected
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {verification.rejection_reason ||
                      "Your verification was not approved. Please review your information and resubmit your documents."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Verification has expired
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Please submit your identity documents again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isUnderReview &&
            !isVerified && (
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Identity document
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the document you want to use for verification.
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleIdentityTypeChange("NRC")
                      }
                      className={`rounded-lg border p-4 text-left transition ${
                        identityType === "NRC"
                          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IdentificationIcon className="h-5 w-5 text-slate-600" />

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            NRC
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Upload both the front and back of your NRC.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleIdentityTypeChange("PASSPORT")
                      }
                      className={`rounded-lg border p-4 text-left transition ${
                        identityType === "PASSPORT"
                          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <DocumentTextIcon className="h-5 w-5 text-slate-600" />

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Passport
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Upload the photo page of your passport.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="identity-document-number"
                    className="block text-sm font-medium text-slate-700"
                  >
                    {identityType === "NRC"
                      ? "NRC number"
                      : "Passport number"}
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    {identityType === "NRC"
                      ? "Enter your NRC number in the format 123456/78/1."
                      : "Enter your passport number in the format ZA123456."}
                  </p>

                  <input
                    id="identity-document-number"
                    type="text"
                    value={documentNumber}
                    onChange={(event) => {
                      setDocumentNumber(
                        event.target.value
                      );
                      setError("");
                    }}
                    placeholder={
                      identityType === "NRC"
                        ? "123456/78/1"
                        : "ZA123456"
                    }
                    disabled={
                      isUnderReview ||
                      isVerified ||
                      submitting
                    }
                    className="mt-3 block w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                {identityType === "NRC" ? (
                  <div className="space-y-4">
                    <DocumentUploadRow
                      title="NRC front"
                      description="Upload the front side of your NRC."
                      documentType="NRC_FRONT"
                      state={front}
                      disabled={
                        isUnderReview ||
                        isVerified ||
                        submitting
                      }
                      onFileChange={handleFileChange}
                      onUpload={handleUpload}
                    />

                    <DocumentUploadRow
                      title="NRC back"
                      description="Upload the back side of your NRC."
                      documentType="NRC_BACK"
                      state={back}
                      disabled={
                        isUnderReview ||
                        isVerified ||
                        submitting
                      }
                      onFileChange={handleFileChange}
                      onUpload={handleUpload}
                    />
                  </div>
                ) : (
                  <DocumentUploadRow
                    title="Passport photo"
                    description="Upload the photo page of your passport."
                    documentType="PASSPORT_PHOTO"
                    state={passport}
                    disabled={
                      isUnderReview ||
                      isVerified ||
                      submitting
                    }
                    onFileChange={handleFileChange}
                    onUpload={handleUpload}
                  />
                )}

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <LockClosedIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Your documents are kept secure
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Your identity documents are used for verification and admin review.
                      </p>
                    </div>
                  </div>
                </div>

                {success && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Submit for verification
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          {isUnderReview && (
            <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-600">
                You cannot change your submitted documents while verification is under review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type DocumentUploadRowProps = {
  title: string;
  description: string;
  documentType: VerificationDocumentType;
  state: DocumentUploadState;
  disabled: boolean;
  onFileChange: (
    event: ChangeEvent<HTMLInputElement>,
    documentType: VerificationDocumentType
  ) => void;
  onUpload: (
    documentType: VerificationDocumentType
  ) => Promise<void>;
};

const DocumentUploadRow = ({
  title,
  description,
  documentType,
  state,
  disabled,
  onFileChange,
  onUpload,
}: DocumentUploadRowProps) => {
  const inputId =
    `verification-${documentType.toLowerCase()}`;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

          {state.fileName && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <DocumentTextIcon className="h-4 w-4 shrink-0" />

              <span className="truncate">
                {state.fileName}
              </span>
            </div>
          )}

          {state.uploaded && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <CheckCircleIcon className="h-4 w-4" />

              <span>
                Uploaded successfully
              </span>
            </div>
          )}

          {state.error && (
            <p className="mt-3 text-xs text-red-600">
              {state.error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${
              disabled
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <ArrowUpTrayIcon className="h-4 w-4" />

            {state.file
              ? "Choose another"
              : "Choose file"}
          </label>

          <input
            id={inputId}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            disabled={disabled}
            onChange={(event) =>
              onFileChange(
                event,
                documentType
              )
            }
          />

          <button
            type="button"
            onClick={() =>
              void onUpload(documentType)
            }
            disabled={
              disabled ||
              !state.file ||
              state.uploading
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.uploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                Uploading...
              </>
            ) : state.uploaded ? (
              "Uploaded"
            ) : (
              "Upload"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdentityVerificationCard;