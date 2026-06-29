import { useTranslations } from "next-intl";

export default function WartungPage() {
  const t = useTranslations("maintenance");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-4xl font-bold text-heading">{t("title")}</h1>
      <p className="max-w-md text-lg text-text/70">{t("message")}</p>
    </div>
  );
}
