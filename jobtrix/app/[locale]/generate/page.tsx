import dynamic from "next/dynamic";

const GenerateForm = dynamic(() => import("@/components/GenerateForm"), {
  ssr: false,
});

export default function GeneratePage() {
  return <GenerateForm />;
}
