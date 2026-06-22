"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { compressImage } from "@/lib/image-compress";
import { EducationEntry, ExperienceEntry, SkillItem } from "@/lib/profile-storage";
import { validateBirthdate, validatePhone, validateLocation, validateYearRange } from "@/lib/validation";

const TOTAL_STEPS = 10;

function makeEduEntry(): EducationEntry {
  return { id: crypto.randomUUID(), institution: "", degree: "", year: "" };
}

function makeExpEntry(): ExperienceEntry {
  return { id: crypto.randomUUID(), company: "", position: "", period: "", tasks: "" };
}

export default function OnboardingForm() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";
  const { data: session } = useSession();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [education, setEducation] = useState<EducationEntry[]>([makeEduEntry()]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [qualifications, setQualifications] = useState<SkillItem[]>([]);
  const [interests, setInterests] = useState<SkillItem[]>([]);
  const [qualInput, setQualInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [birthdateError, setBirthdateError] = useState<string | null>(null);
  const [yearErrors, setYearErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const tErr = useTranslations("onboarding.errors");

  function handleNext() {
    if (step === 1 && !name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSkip() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setPhoto(dataUrl);
  }

  function updateEdu(id: string, field: keyof EducationEntry, value: string) {
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function updateExp(id: string, field: keyof ExperienceEntry, value: string) {
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function addQualification() {
    const trimmed = qualInput.trim();
    if (trimmed && !qualifications.some((q) => q.label === trimmed)) {
      setQualifications((prev) => [...prev, { label: trimmed, value: 60 }]);
    }
    setQualInput("");
  }

  function addInterest() {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.some((i) => i.label === trimmed)) {
      setInterests((prev) => [...prev, { label: trimmed, value: 60 }]);
    }
    setInterestInput("");
  }

  async function handleFinish() {
    setSubmitting(true);
    const dd = birthDay.padStart(2, "0");
    const mm = birthMonth.padStart(2, "0");
    const birthdate = birthYear && birthMonth && birthDay ? `${birthYear}-${mm}-${dd}` : "";

    const filledEducation = education.filter((e) => e.institution || e.degree || e.year);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email,
          phone,
          address,
          birthdate,
          photo,
          education: filledEducation,
          experience,
          qualifications,
          interests,
        }),
      });

      if (res.ok) {
        router.push(`/${locale}/generate`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-accent";
  const inputCenterClass = `${inputClass} text-center text-lg`;

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6 space-y-6">
        {step === 1 && (
          <h1 className="text-2xl font-bold text-primary dark:text-accent text-center">
            {t("welcome")}
          </h1>
        )}

        <div className="space-y-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text/50 text-center">
            {t("stepOf", { current: step, total: TOTAL_STEPS })}
          </p>
        </div>

        <div className="min-h-[180px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step1Title")}</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false); }}
                placeholder={t("step1Placeholder")}
                autoFocus
                className={inputCenterClass}
                aria-label={t("step1Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              {nameError && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{t("step1Error")}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step2Title")}</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("step2Placeholder")}
                autoFocus
                className={inputCenterClass}
                aria-label={t("step2Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step3Title")}</h2>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(validatePhone(e.target.value)); }}
                placeholder={t("step3Placeholder")}
                autoFocus
                className={`${inputCenterClass}${phoneError ? " border-red-500 ring-red-500" : ""}`}
                aria-label={t("step3Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              {phoneError && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{tErr(phoneError)}</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step4Title")}</h2>
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setAddressError(validateLocation(e.target.value)); }}
                placeholder={t("step4Placeholder")}
                autoFocus
                className={`${inputCenterClass}${addressError ? " border-red-500 ring-red-500" : ""}`}
                aria-label={t("step4Title")}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              {addressError && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{tErr(addressError)}</p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step5Title")}</h2>
              <div className="flex gap-3 justify-center">
                <input type="number" min="1" max="31" value={birthDay} onChange={(e) => { setBirthDay(e.target.value); setBirthdateError(validateBirthdate(e.target.value, birthMonth, birthYear)); }} placeholder={t("step5Day")} autoFocus className={`w-20 border dark:bg-surface rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2${birthdateError ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`} aria-label={t("step5Day")} />
                <input type="number" min="1" max="12" value={birthMonth} onChange={(e) => { setBirthMonth(e.target.value); setBirthdateError(validateBirthdate(birthDay, e.target.value, birthYear)); }} placeholder={t("step5Month")} className={`w-24 border dark:bg-surface rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2${birthdateError ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`} aria-label={t("step5Month")} />
                <input type="number" min="1920" max="2020" value={birthYear} onChange={(e) => { setBirthYear(e.target.value); setBirthdateError(validateBirthdate(birthDay, birthMonth, e.target.value)); }} placeholder={t("step5Year")} className={`w-28 border dark:bg-surface rounded-xl px-3 py-3 text-center text-lg focus:outline-none focus:ring-2${birthdateError ? " border-red-500 ring-red-500" : " border-gray-300 dark:border-gray-600 focus:ring-accent"}`} aria-label={t("step5Year")} />
              </div>
              {birthdateError && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{tErr(birthdateError)}</p>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3 text-center">
              <h2 className="text-lg font-semibold text-text">{t("step6Title")}</h2>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
              {photo ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={photo} alt="Foto" className="h-24 w-24 rounded-full object-cover border-2 border-accent" />
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="text-sm text-accent hover:underline">{t("step6Choose")}</button>
                </div>
              ) : (
                <button type="button" onClick={() => photoInputRef.current?.click()} className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold hover:brightness-110 transition">{t("step6Choose")}</button>
              )}
              <p className="text-xs text-text/50">{t("step6Hint")}</p>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step7Title")}</h2>
              {education.map((edu) => (
                <div key={edu.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
                  <input type="text" placeholder={t("step7Institution")} value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} className={inputClass} />
                  <div className="flex gap-2">
                    <input type="text" placeholder={t("step7Degree")} value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} className={`flex-1 ${inputClass}`} />
                    <input type="text" placeholder={t("step7Year")} value={edu.year} onChange={(e) => { updateEdu(edu.id, "year", e.target.value); setYearErrors((prev) => ({ ...prev, [edu.id]: validateYearRange(e.target.value) })); }} className={`w-20 ${inputClass}${yearErrors[edu.id] ? " border-red-500" : ""}`} />
                  </div>
                  {yearErrors[edu.id] && (
                    <p className="text-red-600 dark:text-red-400 text-xs">{tErr(yearErrors[edu.id]!)}</p>
                  )}
                  {education.length > 1 && (
                    <button type="button" onClick={() => setEducation((prev) => prev.filter((e) => e.id !== edu.id))} className="text-xs text-red-500 hover:text-red-700">{t("step7Remove")}</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEducation((prev) => [...prev, makeEduEntry()])} className="text-sm text-accent hover:underline">+ {t("step7Add")}</button>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step8Title")}</h2>
              {experience.length === 0 && (
                <p className="text-sm text-text/50 text-center">{t("skip")}</p>
              )}
              {experience.map((exp) => (
                <div key={exp.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
                  <input type="text" placeholder={t("step8Company")} value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} className={inputClass} />
                  <div className="flex gap-2">
                    <input type="text" placeholder={t("step8Position")} value={exp.position} onChange={(e) => updateExp(exp.id, "position", e.target.value)} className={`flex-1 ${inputClass}`} />
                    <input type="text" placeholder={t("step8Period")} value={exp.period} onChange={(e) => { updateExp(exp.id, "period", e.target.value); setYearErrors((prev) => ({ ...prev, [exp.id]: validateYearRange(e.target.value) })); }} className={`w-36 ${inputClass}${yearErrors[exp.id] ? " border-red-500" : ""}`} />
                  </div>
                  {yearErrors[exp.id] && (
                    <p className="text-red-600 dark:text-red-400 text-xs">{tErr(yearErrors[exp.id]!)}</p>
                  )}
                  <textarea placeholder={t("step8Tasks")} value={exp.tasks} onChange={(e) => updateExp(exp.id, "tasks", e.target.value)} rows={2} className={inputClass} />
                  <button type="button" onClick={() => setExperience((prev) => prev.filter((e) => e.id !== exp.id))} className="text-xs text-red-500 hover:text-red-700">{t("step8Remove")}</button>
                </div>
              ))}
              <button type="button" onClick={() => setExperience((prev) => [...prev, makeExpEntry()])} className="text-sm text-accent hover:underline">+ {t("step8Add")}</button>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step9Title")}</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qualInput}
                  onChange={(e) => setQualInput(e.target.value)}
                  placeholder={t("step9Placeholder")}
                  autoFocus
                  className={`flex-1 ${inputClass}`}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQualification(); } }}
                />
                <button type="button" onClick={addQualification} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110">{t("step9Add")}</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {qualifications.map((q) => (
                  <span key={q.label} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                    {q.label}
                    <button type="button" onClick={() => setQualifications((prev) => prev.filter((x) => x.label !== q.label))} className="text-accent/60 hover:text-accent ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text text-center">{t("step10Title")}</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder={t("step10Placeholder")}
                  autoFocus
                  className={`flex-1 ${inputClass}`}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
                />
                <button type="button" onClick={addInterest} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:brightness-110">{t("step10Add")}</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => (
                  <span key={i.label} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-sm px-3 py-1 rounded-full">
                    {i.label}
                    <button type="button" onClick={() => setInterests((prev) => prev.filter((x) => x.label !== i.label))} className="text-accent/60 hover:text-accent ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="text-sm text-text/60 hover:text-text transition">{t("back")}</button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <div className="flex gap-3">
              {step > 1 && (
                <button type="button" onClick={handleSkip} className="text-sm text-text/50 hover:text-text transition">{t("skip")}</button>
              )}
              <button type="button" onClick={handleNext} className="bg-accent text-white px-8 py-2.5 rounded-full font-semibold hover:brightness-110 transition min-h-[44px]">{t("next")}</button>
            </div>
          ) : (
            <button type="button" onClick={handleFinish} disabled={submitting} className="bg-accent text-white px-8 py-2.5 rounded-full font-semibold hover:brightness-110 transition min-h-[44px] disabled:opacity-40">{t("finish")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
