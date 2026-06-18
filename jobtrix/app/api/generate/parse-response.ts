const SECTION_MARKER = /\*{0,2}\s*(BETREFF|ANSCHREIBEN|LEBENSLAUF|E-MAIL)\s*:\s*\*{0,2}/gi;

function isNoiseLine(line: string, label: string): boolean {
  const trimmed = line.trim();
  if (trimmed === "") return true;
  if (/^[#*\-_=:\s]*[#*\-_=][#*\-_=:\s]*$/.test(trimmed)) return true;
  if (new RegExp(`^[#*\\s]*${label}[#*:\\s]*$`, "i").test(trimmed)) return true;
  return false;
}

function cleanSection(section: string, label: string): string {
  const lines = section.split("\n");
  let start = 0;
  while (start < lines.length && isNoiseLine(lines[start], label)) start++;
  let end = lines.length;
  while (end > start && isNoiseLine(lines[end - 1], label)) end--;
  return lines.slice(start, end).join("\n").trim();
}

export function parseResponse(text: string): {
  emailSubject: string;
  coverLetter: string;
  cv: string;
  emailBody: string;
} {
  const markers = Array.from(text.matchAll(SECTION_MARKER));
  const betreff = markers.find((m) => m[1].toUpperCase() === "BETREFF");
  const anschreiben = markers.find((m) => m[1].toUpperCase() === "ANSCHREIBEN");
  const lebenslauf = markers.find((m) => m[1].toUpperCase() === "LEBENSLAUF");
  const email = markers.find((m) => m[1].toUpperCase() === "E-MAIL");

  const subjectStart = betreff ? betreff.index! + betreff[0].length : 0;
  const subjectEnd = anschreiben ? anschreiben.index! : lebenslauf ? lebenslauf.index! : text.length;
  const coverStart = anschreiben ? anschreiben.index! + anschreiben[0].length : subjectEnd;
  const coverEnd = lebenslauf ? lebenslauf.index! : text.length;
  const cvStart = lebenslauf ? lebenslauf.index! + lebenslauf[0].length : text.length;
  const cvEnd = email ? email.index! : text.length;
  const emailStart = email ? email.index! + email[0].length : text.length;

  return {
    emailSubject: betreff ? cleanSection(text.slice(subjectStart, subjectEnd), "Betreff") : "",
    coverLetter: cleanSection(text.slice(coverStart, coverEnd), "Anschreiben"),
    cv: cleanSection(text.slice(cvStart, cvEnd), "Lebenslauf"),
    emailBody: email ? cleanSection(text.slice(emailStart), "E-Mail") : "",
  };
}
