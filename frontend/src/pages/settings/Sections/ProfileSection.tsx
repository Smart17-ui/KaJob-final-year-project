// frontend/src/pages/settings/ProfileSection.tsx

import { useEffect, useRef, useState } from "react";
import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  addWorkerSkill,
  deleteWorkerSkill,
  getMyWorkerSkills,
  getSkills,
  updateWorkerSkill,
  type Proficiency,
  type Skill,
  type WorkerSkill,
} from "@/api/skills";

import {
  getUserProfile,
  updateUserProfile,
  getWorkerProfile,
  getClientProfile,
  updateWorkerProfile,
  uploadProfilePhoto,
  type WorkerProfile,
  type ClientProfile,
} from "@/api/profile";

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (
  firstName?: string,
  lastName?: string
): string => {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "U";
};

const formatProficiency = (proficiency: Proficiency): string => {
  return (
    proficiency.charAt(0) +
    proficiency.slice(1).toLowerCase()
  );
};

/* =========================================================
   PROFILE SECTION
========================================================= */

const ProfileSection = () => {
  /* =========================
     GENERAL PROFILE
  ========================= */

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  /* =========================
     PROFILE PHOTO
  ========================= */

  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* =========================
     ROLE
  ========================= */

  const [isWorker, setIsWorker] = useState(false);
  const [isClient, setIsClient] = useState(false);

  /* =========================
     WORKER EDITABLE FIELDS
  ========================= */

  const [yearsOfExperience, setYearsOfExperience] = useState(0);

  /* =========================
     ROLE PROFILES
  ========================= */

  const [workerProfile, setWorkerProfile] =
    useState<WorkerProfile | null>(null);

  const [clientProfile, setClientProfile] =
    useState<ClientProfile | null>(null);

  /* =========================
     WORKER SKILLS
  ========================= */

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [workerSkills, setWorkerSkills] = useState<WorkerSkill[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkillId, setEditingSkillId] =
    useState<number | null>(null);

  const [selectedSkillId, setSelectedSkillId] = useState<
    number | ""
  >("");

  const [skillProficiency, setSkillProficiency] =
    useState<Proficiency>("INTERMEDIATE");

  const [skillYearsExperience, setSkillYearsExperience] =
    useState(0);

  const [loadingSkills, setLoadingSkills] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);
  const [deletingSkillId, setDeletingSkillId] =
    useState<number | null>(null);

  /* =========================
     STATE
  ========================= */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getUserProfile();

        const profile = response.profile;
        const user = profile.user;

        setFirstName(user?.first_name ?? "");
        setLastName(user?.last_name ?? "");
        setEmail(user?.email ?? "");
        setBio(profile?.bio ?? "");
        setIsVerified(user?.is_verified ?? false);
        setProfilePhotoUrl(profile?.profile_photo_url ?? null);

        const worker = user?.is_worker ?? false;
        const client = user?.is_client ?? false;

        setIsWorker(worker);
        setIsClient(client);

        if (worker) {
          try {
            const workerResponse = await getWorkerProfile();
            const workerData = workerResponse.worker_profile;
            setWorkerProfile(workerData);
            setYearsOfExperience(workerData.years_of_experience ?? 0);

            const skillsResponse = await getSkills();
            setAvailableSkills(skillsResponse.results ?? []);

            const workerSkillsResponse = await getMyWorkerSkills();
            setWorkerSkills(workerSkillsResponse.results ?? []);
          } catch (error) {
            console.error(
              "Failed to load worker profile or skills:",
              error
            );
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Failed to load your worker profile."
            );
          }
        }

        if (client) {
          try {
            const clientResponse = await getClientProfile();
            setClientProfile(clientResponse.client_profile);
          } catch (error) {
            console.error("Failed to load client profile:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      await updateUserProfile({ bio });

      if (isWorker) {
        const response = await updateWorkerProfile({
          years_of_experience: yearsOfExperience,
        });
        setWorkerProfile(response.worker_profile);
      }

      setSuccessMessage("Profile updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     PROFILE PHOTO — FILE PICKER
  ========================================================= */

  const handleEditPhotoClick = () => {
    setPhotoError("");
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (file.size > MAX_SIZE) {
      setPhotoError("Image is too large. Maximum size is 5 MB.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError(
        "Unsupported image type. Please use JPEG, PNG, or WebP."
      );
      return;
    }

    setPhotoError("");
    setPendingPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    event.target.value = "";
  };

  /* =========================================================
     PROFILE PHOTO — SAVE
  ========================================================= */

  const handleSavePhoto = async () => {
    if (!pendingPhotoFile) return;

    try {
      setIsUploadingPhoto(true);
      setPhotoError("");

      const response = await uploadProfilePhoto(pendingPhotoFile);
      setProfilePhotoUrl(response.profile_photo_url);

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
      setPendingPhotoFile(null);

      setSuccessMessage("Profile photo updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Failed to upload photo."
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  /* =========================================================
     PROFILE PHOTO — CANCEL
  ========================================================= */

  const handleCancelPhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setPendingPhotoFile(null);
    setPhotoError("");
  };

  /* =========================================================
     OPEN ADD SKILL FORM
  ========================================================= */

  const handleAddSkillClick = () => {
    setEditingSkillId(null);
    setSelectedSkillId("");
    setSkillProficiency("INTERMEDIATE");
    setSkillYearsExperience(0);
    setShowSkillForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =========================================================
     OPEN EDIT SKILL FORM
  ========================================================= */

  const handleEditSkill = (skill: WorkerSkill) => {
    setEditingSkillId(skill.id);
    setSelectedSkillId(skill.skill_id);
    setSkillProficiency(skill.proficiency);
    setSkillYearsExperience(skill.years_experience);
    setShowSkillForm(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =========================================================
     SAVE WORKER SKILL
  ========================================================= */

  const handleSaveSkill = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !Number.isInteger(skillYearsExperience) ||
      skillYearsExperience < 0 ||
      skillYearsExperience > 60
    ) {
      setErrorMessage(
        "Years of experience must be a whole number between 0 and 60."
      );
      return;
    }

    if (editingSkillId === null && selectedSkillId === "") {
      setErrorMessage("Please select a skill.");
      return;
    }

    try {
      setSavingSkill(true);

      if (editingSkillId !== null) {
        const response = await updateWorkerSkill(editingSkillId, {
          proficiency: skillProficiency,
          years_experience: skillYearsExperience,
        });

        setWorkerSkills((currentSkills) =>
          currentSkills.map((skill) =>
            skill.id === editingSkillId ? response.skill : skill
          )
        );

        setSuccessMessage(
          response.message || "Skill updated successfully."
        );
      } else {
        const response = await addWorkerSkill({
          skill_id: Number(selectedSkillId),
          proficiency: skillProficiency,
          years_experience: skillYearsExperience,
        });

        setWorkerSkills((currentSkills) => [
          ...currentSkills,
          response.skill,
        ]);

        setSuccessMessage(
          response.message || "Skill added successfully."
        );
      }

      setShowSkillForm(false);
      setEditingSkillId(null);
      setSelectedSkillId("");
      setSkillProficiency("INTERMEDIATE");
      setSkillYearsExperience(0);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save worker skill:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save skill."
      );
    } finally {
      setSavingSkill(false);
    }
  };

  /* =========================================================
     DELETE WORKER SKILL
  ========================================================= */

  const handleDeleteSkill = async (skill: WorkerSkill) => {
    const confirmed = window.confirm(
      `Remove "${skill.skill_name}" from your skills?`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");
    setDeletingSkillId(skill.id);

    try {
      const response = await deleteWorkerSkill(skill.id);

      setWorkerSkills((currentSkills) =>
        currentSkills.filter((currentSkill) => currentSkill.id !== skill.id)
      );

      setSuccessMessage(
        response.message || "Skill removed successfully."
      );

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to delete worker skill:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to remove skill."
      );
    } finally {
      setDeletingSkillId(null);
    }
  };

  /* =========================================================
     CANCEL SKILL FORM
  ========================================================= */

  const handleCancelSkill = () => {
    if (savingSkill) return;

    setShowSkillForm(false);
    setEditingSkillId(null);
    setSelectedSkillId("");
    setSkillProficiency("INTERMEDIATE");
    setSkillYearsExperience(0);
    setErrorMessage("");
  };

  const fullName = `${firstName} ${lastName}`.trim();

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="w-full px-4 py-6 sm:px-8 sm:py-8">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Public profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage how your profile appears to other users.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-8">
      {/* HEADER */}

      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Public profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage how your profile appears to other users.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* BASIC PROFILE */}

      <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* NAME */}
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-slate-900"
            >
              Name
            </label>

            <input
              id="profile-name"
              type="text"
              value={fullName}
              readOnly
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Your name is managed from your account settings.
            </p>
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="profile-email"
              className="block text-sm font-medium text-slate-900"
            >
              Public email
            </label>

            <input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Your email address may be visible to other users
              when appropriate.
            </p>
          </div>

          {/* BIO */}
          <div>
            <label
              htmlFor="profile-bio"
              className="block text-sm font-medium text-slate-900"
            >
              Bio
            </label>

            <textarea
              id="profile-bio"
              rows={5}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell people a little about yourself..."
              className="mt-1.5 block w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              A short description helps others know more about you.
            </p>
          </div>

          {/* SAVE */}
          <div className="border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* PROFILE PICTURE */}

        <div className="flex flex-col items-start">
          <h3 className="text-sm font-semibold text-slate-900">
            Profile picture
          </h3>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelected}
          />

          <div className="relative mt-3">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-4xl font-semibold text-emerald-700 ring-4 ring-emerald-50">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="New profile preview"
                  className="h-full w-full object-cover"
                />
              ) : profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${fullName} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(firstName, lastName)
              )}
            </div>

            {!pendingPhotoFile && (
              <button
                type="button"
                onClick={handleEditPhotoClick}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          {pendingPhotoFile && (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleSavePhoto()}
                disabled={isUploadingPhoto}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingPhoto ? (
                  <>
                    <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save photo"
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelPhoto}
                disabled={isUploadingPhoto}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}

          {photoError && (
            <p className="mt-3 max-w-[200px] text-xs leading-5 text-red-600">
              {photoError}
            </p>
          )}

          <p className="mt-3 max-w-[200px] text-xs leading-5 text-slate-500">
            Your profile picture helps other users recognize you.
            Maximum size 5 MB. JPEG, PNG, or WebP.
          </p>

          <div className="mt-5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                isVerified
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isVerified ? "Verified account" : "Not verified"}
            </span>
          </div>
        </div>
      </div>

      {/* WORKER PROFILE */}

      {isWorker && workerProfile && (
        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Worker profile
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Information that helps clients understand your
              experience and work history.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="years-of-experience"
                className="block text-sm font-medium text-slate-900"
              >
                Years of experience
              </label>

              <input
                id="years-of-experience"
                type="number"
                min="0"
                max="60"
                value={yearsOfExperience}
                onChange={(event) =>
                  setYearsOfExperience(
                    Math.min(
                      60,
                      Math.max(0, Number(event.target.value) || 0)
                    )
                  )
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-1.5 text-xs text-slate-500">
                General work experience. Skill-specific
                experience can be managed below.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Rating</p>

              <div className="mt-1 flex items-center gap-1">
                <StarIcon className="h-5 w-5 text-amber-500" />
                <p className="text-xl font-semibold text-slate-900">
                  {workerProfile.average_rating}
                </p>
              </div>

              <p className="text-xs text-slate-500">
                {workerProfile.total_reviews}{" "}
                {workerProfile.total_reviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">
                Jobs completed
              </p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {workerProfile.jobs_completed}
              </p>

              <p className="text-xs text-slate-500">completed jobs</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">
                Availability
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {workerProfile.availability_status
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())}
              </p>

              <p className="mt-1 text-xs text-slate-500">Current status</p>
            </div>
          </div>

          {/* SKILLS */}

          <div className="mt-8">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Skills
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Add the skills you use for work and describe your
                  experience with each one.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSkillClick}
                disabled={loadingSkills || savingSkill}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlusIcon className="h-4 w-4" />
                Add skill
              </button>
            </div>

            {loadingSkills && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                  Loading your skills...
                </div>
              </div>
            )}

            {showSkillForm && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">
                      {editingSkillId !== null ? "Edit skill" : "Add skill"}
                    </h5>

                    <p className="mt-1 text-xs text-slate-500">
                      {editingSkillId !== null
                        ? "Update your proficiency and experience."
                        : "Select a skill and describe your experience with it."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelSkill}
                    disabled={savingSkill}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close skill form"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="skill-name"
                      className="block text-sm font-medium text-slate-900"
                    >
                      Skill
                    </label>

                    {editingSkillId !== null ? (
                      <input
                        id="skill-name"
                        type="text"
                        value={
                          workerSkills.find(
                            (skill) => skill.id === editingSkillId
                          )?.skill_name ?? ""
                        }
                        readOnly
                        className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
                      />
                    ) : (
                      <select
                        id="skill-name"
                        value={selectedSkillId}
                        onChange={(event) =>
                          setSelectedSkillId(
                            event.target.value === ""
                              ? ""
                              : Number(event.target.value)
                          )
                        }
                        disabled={savingSkill}
                        className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        <option value="">Select a skill</option>

                        {availableSkills
                          .filter(
                            (skill) =>
                              !workerSkills.some(
                                (workerSkill) =>
                                  workerSkill.skill_id === skill.id
                              )
                          )
                          .map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                              {skill.category ? ` — ${skill.category}` : ""}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="skill-proficiency"
                      className="block text-sm font-medium text-slate-900"
                    >
                      Proficiency
                    </label>

                    <select
                      id="skill-proficiency"
                      value={skillProficiency}
                      onChange={(event) =>
                        setSkillProficiency(
                          event.target.value as Proficiency
                        )
                      }
                      disabled={savingSkill}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="skill-years-experience"
                      className="block text-sm font-medium text-slate-900"
                    >
                      Years of experience
                    </label>

                    <input
                      id="skill-years-experience"
                      type="number"
                      min="0"
                      max="60"
                      value={skillYearsExperience}
                      onChange={(event) =>
                        setSkillYearsExperience(
                          Math.min(
                            60,
                            Math.max(0, Number(event.target.value) || 0)
                          )
                        )
                      }
                      disabled={savingSkill}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelSkill}
                    disabled={savingSkill}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSaveSkill()}
                    disabled={savingSkill}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingSkill
                      ? "Saving..."
                      : editingSkillId !== null
                      ? "Update skill"
                      : "Add skill"}
                  </button>
                </div>
              </div>
            )}

            {!loadingSkills && workerSkills.length > 0 ? (
              <div className="mt-4 space-y-3">
                {workerSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-sm font-semibold text-slate-900">
                            {skill.skill_name}
                          </h5>

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {skill.proficiency_display ||
                              formatProficiency(skill.proficiency)}
                          </span>

                          {skill.skill_category && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {skill.skill_category}
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-xs text-slate-500">
                          {skill.years_experience}{" "}
                          {skill.years_experience === 1 ? "year" : "years"} of
                          experience
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSkill(skill)}
                          disabled={savingSkill || deletingSkillId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteSkill(skill)}
                          disabled={savingSkill || deletingSkillId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          {deletingSkillId === skill.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loadingSkills &&
              !showSkillForm && (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No skills added yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the skills you use so clients can better understand
                    what you can do.
                  </p>

                  <button
                    type="button"
                    onClick={handleAddSkillClick}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add your first skill
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* CLIENT PROFILE */}

      {isClient && clientProfile && (
        <div className="mt-10 border-t border-slate-200 pt-8">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Client profile
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Information about your activity and reputation on KaJob.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Rating</p>

              <div className="mt-1 flex items-center gap-1">
                <StarIcon className="h-5 w-5 text-amber-500" />
                <p className="text-xl font-semibold text-slate-900">
                  {clientProfile.average_rating}
                </p>
              </div>

              <p className="text-xs text-slate-500">Average rating</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Reviews</p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {clientProfile.total_reviews}
              </p>

              <p className="text-xs text-slate-500">received from workers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
