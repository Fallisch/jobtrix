"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ProfileData,
  EducationEntry,
  ProfileErrors,
  loadProfile,
  saveProfile,
  validateProfile,
} from "@/lib/profile-storage";
import { compressImage } from "@/lib/image-compress";

function makeEduEntry(): EducationEntry {
  return { id: crypto.randomUUID(), institution: "", degree: "", year: "" };
}

const empty: ProfileData = {
  name: "",
  address: "",
  email: "",
  phone: "",
  birthdate: "",
  photo: null,
  education: [makeEduEntry()],
  qualifications: [],
  interests: [],
};

export default function ProfileForm() {
  const t = useTranslations("profile");
  const router = useRouter();
  const [data, setData] = useState<ProfileData>(empty);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [qualInput, setQualInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    const saved = loadProfile();
    if (saved) setData(saved);
  }, []);

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function updateEdu(id: string, field: keyof EducationEntry, value: string) {
    setData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function addEdu() {
    setData((d) => ({ ...d, education: [...d.education, makeEduEntry()] }));
  }

  function removeEdu(id: string) {
    setData((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));
  }

  function addQualification(value: string) {
    const trimmed = value.trim();
    if (trimmed && !data.qualifications.some((q) => q.label === trimmed)) {
      setData((d) => ({ ...d, qualifications: [...d.qualifications, { label: trimmed, value: 60 }] }));
    }
    setQualInput("");
  }

  function removeQualification(label: string) {
    setData((d) => ({ ...d, qualifications: d.qualifications.filter((q) => q.label !== label) }));
  }

  function updateQualificationValue(label: string, value: number) {
    setData((d) => ({
      ...d,
      qualifications: d.qualifications.map((q) => q.label === label ? { ...q, value } : q),
    }));
  }

  function addInterest(value: string) {
    const trimmed = value.trim();
    if (trimmed && !data.interests.some((i) => i.label === trimmed)) {
      setData((d) => ({ ...d, interests: [...d.interests, { label: trimmed, value: 60 }] }));
    }
    setInterestInput("");
  }

  function removeInterest(label: string) {
    setData((d) => ({ ...d, interests: d.interests.filter((i) => i.label !== label) }));
  }

  function updateInterestValue(label: string, value: number) {
    setData((d) => ({
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateProfile(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      saveProfile(data);
      router.push("/");
    } catch {
      setSaveError(t("saveError"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>

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
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("nameLabel")}
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{t(`errors.${errors.name}`)}</p>}
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
          onChange={(e) => set("address", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("addressLabel")}
        />
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
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
          onChange={(e) => set("phone", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("phoneLabel")}
        />
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
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
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="block text-sm text-text/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:brightness-110"
        />
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
        <h2 className="text-lg font-semibold text-primary mb-2">{t("educationTitle")}</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-md p-3 mb-3 space-y-2">
            <input
              type="text"
              placeholder={t("institutionPlaceholder")}
              value={edu.institution}
              onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("degreePlaceholder")}
                value={edu.degree}
                onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                placeholder={t("yearPlaceholder")}
                value={edu.year}
                onChange={(e) => updateEdu(edu.id, "year", e.target.value)}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="button"
              onClick={() => removeEdu(edu.id)}
              className="text-sm text-red-500 hover:text-red-700"
              aria-label={t("remove")}
            >
              {t("remove")}
            </button>
          </div>
        ))}
        {errors.education && (
          <p className="text-red-600 text-sm mt-1">{t(`errors.${errors.education}`)}</p>
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

      {/* Qualifikationen */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">{t("qualificationsTitle")}</h2>
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
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => addQualification(qualInput)}
            className="px-3 py-2 bg-surface border border-gray-300 rounded-md text-sm hover:bg-gray-100"
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
              <span className="text-xs text-gray-500">{q.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Persönliche Interessen */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">{t("interestsTitle")}</h2>
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
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => addInterest(interestInput)}
            className="px-3 py-2 bg-surface border border-gray-300 rounded-md text-sm hover:bg-gray-100"
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
              <span className="text-xs text-gray-500">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speichern */}
      {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
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
