"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import {
  ProfileData,
  EducationEntry,
  ExperienceEntry,
  ProfileErrors,
  validateProfile,
} from "@/lib/profile-storage";
import { compressImage } from "@/lib/image-compress";
import { validatePhone, validateLocation, validateYearRange } from "@/lib/validation";

function makeEduEntry(): EducationEntry {
  return { id: crypto.randomUUID(), institution: "", degree: "", year: "" };
}

function makeExpEntry(): ExperienceEntry {
  return { id: crypto.randomUUID(), company: "", position: "", period: "", tasks: "" };
}

const empty: ProfileData = {
  name: "",
  address: "",
  email: "",
  phone: "",
  birthdate: "",
  photo: null,
  education: [makeEduEntry()],
  experience: [],
  qualifications: [],
  interests: [],
};

interface AccessState {
  package: "none" | "limited" | "lifetime";
  validUntil: string | null;
}

export default function ProfileForm() {
  const t = useTranslations("profile");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";
  const [data, setData] = useState<ProfileData>(empty);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [qualInput, setQualInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [access, setAccess] = useState<AccessState | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [yearErrors, setYearErrors] = useState<Record<string, string | null>>({});
  const interactedRef = useRef(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const tErr = useTranslations("profile.errors");

  useEffect(() => {
    const draft = sessionStorage.getItem("profile-draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as ProfileData;
        setData({
          ...parsed,
          education: parsed.education.length > 0 ? parsed.education : [makeEduEntry()],
        });
        interactedRef.current = true;
      } catch {
        sessionStorage.removeItem("profile-draft");
      }
    } else {
      fetch("/api/profile")
        .then((res) => (res.ok ? (res.json() as Promise<ProfileData>) : null))
        .then((profile) => {
          if (!profile || interactedRef.current) return;
          setData({
            ...profile,
            education: profile.education.length > 0 ? profile.education : [makeEduEntry()],
          });
        })
        .catch(() => {});
    }

    fetch("/api/access")
      .then((res) => (res.ok ? (res.json() as Promise<AccessState>) : null))
      .then((accessState) => {
        if (accessState) setAccess(accessState);
      })
      .catch(() => {});
  }, []);

  function mutate(updater: (d: ProfileData) => ProfileData) {
    interactedRef.current = true;
    setData((prev) => {
      const next = updater(prev);
      sessionStorage.setItem("profile-draft", JSON.stringify(next));
      return next;
    });
  }

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    mutate((d) => ({ ...d, [key]: value }));
  }

  function updateEdu(id: string, field: keyof EducationEntry, value: string) {
    mutate((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function addEdu() {
    mutate((d) => ({ ...d, education: [...d.education, makeEduEntry()] }));
  }

  function removeEdu(id: string) {
    mutate((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));
  }

  function updateExp(id: string, field: keyof ExperienceEntry, value: string) {
    mutate((d) => ({
      ...d,
      experience: d.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function addExp() {
    mutate((d) => ({ ...d, experience: [...d.experience, makeExpEntry()] }));
  }

  function removeExp(id: string) {
    mutate((d) => ({ ...d, experience: d.experience.filter((e) => e.id !== id) }));
  }

  function addQualification(value: string) {
    const trimmed = value.trim();
    if (trimmed && !data.qualifications.some((q) => q.label === trimmed)) {
      mutate((d) => ({ ...d, qualifications: [...d.qualifications, { label: trimmed, value: 60 }] }));
    }
    setQualInput("");
  }

  function removeQualification(label: string) {
    mutate((d) => ({ ...d, qualifications: d.qualifications.filter((q) => q.label !== label) }));
  }

  function updateQualificationValue(label: string, value: number) {
    mutate((d) => ({
      ...d,
      qualifications: d.qualifications.map((q) => q.label === label ? { ...q, value } : q),
    }));
  }

  function addInterest(value: string) {
    const trimmed = value.trim();
    if (trimmed && !data.interests.some((i) => i.label === trimmed)) {
      mutate((d) => ({ ...d, interests: [...d.interests, { label: trimmed, value: 60 }] }));
    }
    setInterestInput("");
  }

  function removeInterest(label: string) {
    mutate((d) => ({ ...d, interests: d.interests.filter((i) => i.label !== label) }));
  }

  function updateInterestValue(label: string, value: number) {
    mutate((d) => ({
      ...d,
      interests: d.interests.map((i) => i.label === label ? { ...i, value } : i),
    }));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    set("photo", dataUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateProfile(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setSaveError(t("saveError"));
        return;
      }
      setSaveError(null);
      sessionStorage.removeItem("profile-draft");
      router.push(`/${locale}/generate`);
    } catch {
      setSaveError(t("saveError"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>

      {access?.package === "limited" && access.validUntil && (
        <p className="text-sm text-text/70 bg-surface border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2">
          {t("accessValidUntil", {
            date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
              new Date(access.validUntil)
            ),
          })}
        </p>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("nameLabel")}
        />
        {errors.name && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.${errors.name}`)}</p>}
      </div>

      {/* Adresse */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          {t("addressLabel")}
        </label>
        <input
          id="address"
          type="text"
          value={data.address}
          onChange={(e) => { set("address", e.target.value); setAddressError(validateLocation(e.target.value)); }}
          className={`w-full border dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2${addressError ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`}
          aria-label={t("addressLabel")}
        />
        {addressError && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{tErr(addressError)}</p>}
      </div>

      {/* E-Mail */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("emailLabel")}
        />
      </div>

      {/* Telefon */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          {t("phoneLabel")}
        </label>
        <input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => { set("phone", e.target.value); setPhoneError(validatePhone(e.target.value)); }}
          className={`w-full border dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2${phoneError ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`}
          aria-label={t("phoneLabel")}
        />
        {phoneError && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{tErr(phoneError)}</p>}
      </div>

      {/* Geburtsdatum */}
      <div>
        <label htmlFor="birthdate" className="block text-sm font-medium mb-1">
          {t("birthdateLabel")}
        </label>
        <input
          id="birthdate"
          type="date"
          value={data.birthdate}
          onChange={(e) => set("birthdate", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("birthdateLabel")}
        />
      </div>

      {/* Foto */}
      <div>
        <label htmlFor="photo" className="block text-sm font-medium mb-1">
          {t("photoLabel")}
        </label>
        <input
          id="photo"
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="rounded-full py-2 px-4 text-sm font-semibold bg-accent text-white hover:brightness-110"
        >
          {t("photoChooseFile")}
        </button>
        {data.photo && (
          <img
            src={data.photo}
            alt={t("photoPreviewAlt")}
            className="mt-2 h-20 w-20 rounded-full object-cover border"
          />
        )}
      </div>

      {/* Ausbildung */}
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-accent mb-2">{t("educationTitle")}</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-3 space-y-2">
            <input
              type="text"
              placeholder={t("institutionPlaceholder")}
              value={edu.institution}
              onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("degreePlaceholder")}
                value={edu.degree}
                onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                placeholder={t("yearPlaceholder")}
                value={edu.year}
                onChange={(e) => { updateEdu(edu.id, "year", e.target.value); setYearErrors((prev) => ({ ...prev, [edu.id]: validateYearRange(e.target.value) })); }}
                className={`w-24 border dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2${yearErrors[edu.id] ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`}
              />
            </div>
            {yearErrors[edu.id] && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{tErr(yearErrors[edu.id]!)}</p>
            )}
            <button
              type="button"
              onClick={() => removeEdu(edu.id)}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label={t("remove")}
            >
              {t("remove")}
            </button>
          </div>
        ))}
        {errors.education && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{t(`errors.${errors.education}`)}</p>
        )}
        <button
          type="button"
          onClick={addEdu}
          className="text-sm text-accent hover:underline"
          aria-label={t("addEducation")}
        >
          + {t("addEducation")}
        </button>
      </div>

      {/* Berufserfahrung */}
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-accent mb-2">{t("experienceTitle")}</h2>
        {data.experience.map((exp) => (
          <div key={exp.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-3 space-y-2">
            <input
              type="text"
              placeholder={t("companyPlaceholder")}
              value={exp.company}
              onChange={(e) => updateExp(exp.id, "company", e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("positionPlaceholder")}
                value={exp.position}
                onChange={(e) => updateExp(exp.id, "position", e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                placeholder={t("periodPlaceholder")}
                value={exp.period}
                onChange={(e) => { updateExp(exp.id, "period", e.target.value); setYearErrors((prev) => ({ ...prev, [exp.id]: validateYearRange(e.target.value) })); }}
                className={`w-32 border dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2${yearErrors[exp.id] ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`}
              />
            </div>
            {yearErrors[exp.id] && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{tErr(yearErrors[exp.id]!)}</p>
            )}
            <textarea
              placeholder={t("tasksPlaceholder")}
              value={exp.tasks}
              onChange={(e) => updateExp(exp.id, "tasks", e.target.value)}
              rows={3}
              spellCheck={false}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => removeExp(exp.id)}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label={t("remove")}
            >
              {t("remove")}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addExp}
          className="text-sm text-accent hover:underline"
          aria-label={t("addExperience")}
        >
          + {t("addExperience")}
        </button>
      </div>

      {/* Qualifikationen */}
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-accent mb-2">{t("qualificationsTitle")}</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder={t("qualificationPlaceholder")}
            value={qualInput}
            onChange={(e) => setQualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQualification(qualInput);
              }
            }}
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => addQualification(qualInput)}
            className="px-3 py-2 bg-surface border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t("add")}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {data.qualifications.map((q) => (
            <div key={q.label} className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {q.label}
                <button
                  type="button"
                  onClick={() => removeQualification(q.label)}
                  className="text-accent/60 hover:text-accent ml-1"
                  aria-label={t("removeItem", { label: q.label })}
                >
                  ×
                </button>
              </span>
              <input
                type="range"
                min={20}
                max={100}
                step={20}
                value={q.value}
                onChange={(e) => updateQualificationValue(q.label, Number(e.target.value))}
                aria-label={q.label}
                className="w-32 accent-accent"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{q.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Persönliche Interessen */}
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-accent mb-2">{t("interestsTitle")}</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder={t("interestPlaceholder")}
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInterest(interestInput);
              }
            }}
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => addInterest(interestInput)}
            className="px-3 py-2 bg-surface border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t("addInterest")}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {data.interests.map((s) => (
            <div key={s.label} className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                {s.label}
                <button
                  type="button"
                  onClick={() => removeInterest(s.label)}
                  className="text-accent/60 hover:text-accent ml-1"
                  aria-label={t("removeItem", { label: s.label })}
                >
                  ×
                </button>
              </span>
              <input
                type="range"
                min={20}
                max={100}
                step={20}
                value={s.value}
                onChange={(e) => updateInterestValue(s.label, Number(e.target.value))}
                aria-label={s.label}
                className="w-32 accent-accent"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speichern */}
      {saveError && <p className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:brightness-110 transition"
        aria-label={t("save")}
      >
        {t("save")}
      </button>
    </form>
  );
}
