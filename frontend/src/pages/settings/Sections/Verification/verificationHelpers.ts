export const getStatusLabel = (
  status: string | null | undefined
): string => {
  switch (status) {
    case "NOT_SUBMITTED":
      return "Not submitted";

    case "PENDING":
      return "Pending";

    case "UNDER_REVIEW":
      return "Under review";

    case "VERIFIED":
      return "Verified";

    case "REJECTED":
      return "Rejected";

    case "EXPIRED":
      return "Expired";

    default:
      return "Not verified";
  }
};

export const getStatusClasses = (
  status: string | null | undefined
): string => {
  switch (status) {
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-700";

    case "REJECTED":
    case "EXPIRED":
      return "bg-red-50 text-red-700";

    case "NOT_SUBMITTED":
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const getDocumentNumberPlaceholder = (
  documentType: string
): string => {
  switch (documentType) {
    case "NRC":
      return "123456/78/1";

    case "PASSPORT":
      return "ZA123456";

    default:
      return "Enter document number";
  }
};

export const validateDocumentNumber = (
  documentType: string,
  documentNumber: string
): string | null => {
  const value = documentNumber.trim();

  if (!value) {
    return "Document number is required.";
  }

  if (documentType === "NRC") {
    if (!/^\d{6}\/\d{2}\/\d{1}$/.test(value)) {
      return "Invalid NRC format. Expected: 123456/78/1";
    }
  }

  if (documentType === "PASSPORT") {
    if (!/^[A-Z]{2}\d{6}$/.test(value)) {
      return "Invalid Passport format. Expected: ZA123456";
    }
  }

  return null;
};

export const validateVerificationFile = (
  file: File
): string | null => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    return "File too large. Maximum size is 10 MB.";
  }

  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    return "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG.";
  }

  if (
    file.type &&
    !allowedTypes.includes(file.type)
  ) {
    return "Unsupported file type. Allowed: PDF, JPG, PNG.";
  }

  return null;
};