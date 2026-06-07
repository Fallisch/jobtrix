"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ProfileData,
  EducationEntry,
  ProfileErrors,
  loadProfile,
  saveProfile,
  validateProfile,
} from "@/lib/profile-storage";

function makeEduEntry(): EducationEntry {
  return { id: crypto.randomUUID(), institution: "", degree: "", year: "" };
}

const empty: ProfileData = {
  name: "",
  address: "",
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
    if (trimmed && !data.qualifications.includes(trimmed)) {
      setData((d) => ({ ...d, qualifications: [...d.qualifications, trimmed] }));
    }
    setQualInput("");
  }

  function removeQualification(q: string) {
    setData((d) => ({ ...d, qualifications: d.qualifications.filter((x) => x !== q) }));
  }

  function addInterest(value: string) {
    const trimmed = value.trim();
    if (trimmed && !data.interests.includes(trimmed)) {
      setData((d) => ({ ...d, interests: [...d.interests, trimmed] }));
    }
    setInterestInput("");
  }

  function removeInterest(s: string) {
    setData((d) => ({ ...d, interests: d.interests.filter((x) => x !== s) }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateProfile(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    saveProfile(data);
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Profil</h1>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Name"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Adresse */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Adresse
        </label>
        <input
          id="address"
          type="text"
          value={data.address}
          onChange={(e) => set("address", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Adresse"
        />
      </div>

      {/* Geburtsdatum */}
      <div>
        <label htmlFor="birthdate" className="block text-sm font-medium mb-1">
          Geburtsdatum
        </label>
        <input
          id="birthdate"
          type="date"
          value={data.birthdate}
          onChange={(e) => set("birthdate", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Geburtsdatum"
        />
      </div>

      {/* Foto */}
      <div>
        <label htmlFor="photo" className="block text-sm font-medium mb-1">
          Foto
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
            alt="Vorschau"
            className="mt-2 h-20 w-20 rounded-full object-cover border"
          />
        )}
      </div>

      {/* Ausbildung */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">Ausbildung *</h2>
        {data.education.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-md p-3 mb-3 space-y-2">
            <input
              type="text"
              placeholder="Institution"
              value={edu.institution}
              onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Abschluss"
                value={edu.degree}
                onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                placeholder="Jahr"
                value={edu.year}
                onChange={(e) => updateEdu(edu.id, "year", e.target.value)}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="button"
              onClick={() => removeEdu(edu.id)}
              className="text-sm text-red-500 hover:text-red-700"
              aria-label="Entfernen"
            >
              Entfernen
            </button>
          </div>
        ))}
        {errors.education && (
          <p className="text-red-600 text-sm mt-1">{errors.education}</p>
        )}
        <button
          type="button"
          onClick={addEdu}
          className="text-sm text-accent hover:underline"
          aria-label="Ausbildung hinzufügen"
        >
          + Ausbildung hinzufügen
        </button>
      </div>

      {/* Qualifikationen */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">Qualifikationen</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="z. B. TypeScript"
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
            Hinzufügen
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.qualifications.map((q) => (
            <span
              key={q}
              className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full"
            >
              {q}
              <button
                type="button"
                onClick={() => removeQualification(q)}
                className="text-accent/60 hover:text-accent ml-1"
                aria-label={`${q} entfernen`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Persönliche Interessen */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-2">Persönliche Interessen</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="z. B. Fotografie"
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
            Interesse hinzufügen
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.interests.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full"
            >
              {s}
              <button
                type="button"
                onClick={() => removeInterest(s)}
                className="text-accent/60 hover:text-accent ml-1"
                aria-label={`${s} entfernen`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Speichern */}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:brightness-110 transition"
        aria-label="Speichern"
      >
        Speichern
      </button>
    </form>
  );
}
