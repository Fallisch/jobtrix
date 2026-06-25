import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Svg, Defs, LinearGradient, Stop, Rect, Path } from "@react-pdf/renderer";
import { ProfileData, SkillItem, ExperienceEntry, EducationEntry } from "@/lib/profile-storage";

const ACCENT = "#2F80ED";
const PRIMARY = "#1E3A5F";
const SIDEBAR_BG = "#1E3A5F";

const styles = StyleSheet.create({
  // ── Classic template ───────────────────────────────────────────────────────
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 56,
    color: "#1a1a1a",
    lineHeight: 1.45,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: ACCENT,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 3,
  },
  meta: {
    fontSize: 9.5,
    color: "#6b7280",
  },
  paragraph: {
    marginBottom: 7,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },
  documentLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 1,
    marginBottom: 8,
  },

  // ── Cover Letter Modern (left dark sidebar) ────────────────────────────────
  modernPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.45,
    flexDirection: "row",
  },
  modernSidebar: {
    width: "32%",
    backgroundColor: SIDEBAR_BG,
    padding: 20,
    color: "#ffffff",
    minHeight: "100%",
  },
  modernSidebarName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 4,
    marginTop: 8,
  },
  modernSidebarMeta: {
    fontSize: 8.5,
    color: "#cbd5e1",
    marginBottom: 3,
  },
  modernSidebarPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    objectFit: "cover",
  },
  modernContent: {
    width: "68%",
    padding: 24,
  },
  modernParagraph: {
    marginBottom: 6,
  },
  modernSectionHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 3,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },

  // ── CV Modern ──────────────────────────────────────────────────────────────
  cvModernPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.45,
  },
  // Header: circle photo + name bar
  cvNameBar: {
    backgroundColor: SIDEBAR_BG,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  cvHeaderPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    objectFit: "cover",
  },
  cvHeaderName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  // Info row: birthdate | address | email+phone
  cvInfoBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 40,
    backgroundColor: "#f8f9fa",
  },
  cvInfoCell: {
    flex: 1,
    alignItems: "center",
  },
  cvInfoText: {
    fontSize: 8.5,
    color: "#374151",
    textAlign: "center",
  },
  // Two-column content: left 55% | right 45%
  cvTwoColumns: {
    flexDirection: "row",
  },
  cvLeftCol: {
    width: "58%",
    paddingLeft: 36,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 20,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  cvRightCol: {
    width: "42%",
    paddingLeft: 18,
    paddingRight: 36,
    paddingTop: 16,
    paddingBottom: 20,
  },
  cvSectionHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.3,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  // Data rows (Persönliche Daten)
  cvDataRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  cvDataLabel: {
    width: 70,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
  },
  cvDataValue: {
    flex: 1,
    fontSize: 9,
    color: "#1a1a1a",
  },
  // Education entries
  cvEduEntry: {
    marginBottom: 8,
  },
  cvEduYear: {
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 1,
  },
  cvEduDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  cvEduInstitution: {
    fontSize: 9,
    color: "#374151",
  },
  // Experience entries
  cvExpEntry: {
    marginBottom: 8,
  },
  cvExpPeriod: {
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 1,
  },
  cvExpPosition: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
  },
  cvExpCompany: {
    fontSize: 9,
    color: "#374151",
  },
  cvExpTask: {
    fontSize: 8.5,
    color: "#374151",
    marginTop: 2,
    marginLeft: 8,
  },
  // Skill bars (right column)
  skillRow: {
    marginBottom: 6,
  },
  skillLabel: {
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 2,
  },
  skillBarBg: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
  },
  skillBarFill: {
    height: 4,
    width: "72%",
    backgroundColor: ACCENT,
    borderRadius: 2,
  },

  // ── Traditional template (schwarz-weiß, tabellarisch) ──────────────────────
  traditionalPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 56,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  traditionalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  traditionalHeaderLeft: {
    flexGrow: 1,
  },
  traditionalDocumentLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    letterSpacing: 1,
    marginBottom: 8,
  },
  traditionalName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  traditionalMeta: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 1,
  },
  traditionalPhoto: {
    width: 70,
    height: 90,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  traditionalSectionHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#1a1a1a",
  },
  traditionalTable: {
    borderWidth: 0.75,
    borderColor: "#9ca3af",
  },
  traditionalTableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  traditionalCellPeriod: {
    width: 90,
    fontSize: 9,
    color: "#374151",
  },
  traditionalCellContent: {
    flex: 1,
  },
  traditionalCellTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  traditionalCellSubtitle: {
    fontSize: 9,
    color: "#374151",
  },
  traditionalCellTask: {
    fontSize: 8.5,
    color: "#374151",
    marginTop: 2,
    marginLeft: 6,
  },
  traditionalListItem: {
    fontSize: 9.5,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  traditionalParagraph: {
    marginBottom: 7,
    fontSize: 10,
    color: "#1a1a1a",
  },
  traditionalRecipientBlock: {
    marginBottom: 12,
    minHeight: 60,
  },
  traditionalDateRow: {
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 10,
    textAlign: "right",
  },
  traditionalSubject: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },

  // ── Accent template (Foto-Banner mit Farbverlauf, Zeitstrahl) ───────────────
  accentPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  accentBannerWrap: {
    position: "relative",
    height: 130,
  },
  accentBannerSvg: {
    width: "100%",
    height: 130,
  },
  accentBannerPhoto: {
    position: "absolute",
    top: 20,
    left: 40,
    width: 90,
    height: 90,
    borderRadius: 6,
    objectFit: "cover",
  },
  accentNameBand: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  accentName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  accentBewerbungBand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
  },
  accentStripe: {
    width: 40,
    height: 3,
    marginHorizontal: 10,
  },
  accentBewerbungText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  accentInfoBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 40,
    backgroundColor: "#f8f9fa",
  },
  accentInfoCell: {
    flex: 1,
    alignItems: "center",
  },
  accentInfoText: {
    fontSize: 8.5,
    color: "#374151",
    textAlign: "center",
  },
  accentTwoColumns: {
    flexDirection: "row",
  },
  accentLeftCol: {
    width: "58%",
    paddingLeft: 36,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  accentRightCol: {
    width: "42%",
    paddingLeft: 18,
    paddingRight: 36,
    paddingTop: 16,
    paddingBottom: 20,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
  },
  accentSectionHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 14,
    letterSpacing: 0.3,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  accentTimelineEntry: {
    flexDirection: "row",
    marginBottom: 10,
  },
  accentTimelineMarker: {
    width: 16,
    fontSize: 10,
  },
  accentTimelineContent: {
    flex: 1,
  },
  accentTimelinePeriod: {
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 1,
  },
  accentTimelineTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  accentTimelineSubtitle: {
    fontSize: 9,
    color: "#374151",
  },
  accentTimelineTask: {
    fontSize: 8.5,
    color: "#374151",
    marginTop: 2,
    marginLeft: 24,
  },
  accentLetterBody: {
    paddingHorizontal: 56,
    paddingTop: 20,
    paddingBottom: 24,
  },
  accentSectionHeadingLetter: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },
  accentParagraph: {
    marginBottom: 7,
  },

  // ── Creative template (Icon-Seitenleiste, rundes Foto) ──────────────────────
  creativePage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.4,
    flexDirection: "row",
  },
  creativeSidebar: {
    width: "34%",
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  creativeSidebarPhoto: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
    objectFit: "cover",
  },
  creativeSidebarName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  creativeSidebarSection: {
    width: "100%",
    marginTop: 14,
  },
  creativeSidebarSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  creativeContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  creativeContactIcon: {
    width: 11,
    height: 11,
    marginRight: 6,
  },
  creativeContactText: {
    fontSize: 8.5,
    color: "#f1f5f9",
  },
  creativeSkillItem: {
    width: "100%",
    marginBottom: 8,
  },
  creativeSkillLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  creativeSkillIcon: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  creativeSkillLabel: {
    fontSize: 8.5,
    color: "#ffffff",
  },
  creativeSkillBarBg: {
    height: 4,
    backgroundColor: "#475569",
    borderRadius: 2,
  },
  creativeSkillBarFill: {
    height: 4,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  creativeMain: {
    width: "66%",
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  creativeMainName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  creativeSectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  creativeSectionHeadingIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  creativeSectionHeadingText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.3,
  },
  creativeTimelineEntry: {
    flexDirection: "row",
    marginBottom: 7,
  },
  creativeTimelineIcon: {
    width: 13,
    height: 13,
    marginTop: 1,
    marginRight: 8,
  },
  creativeTimelineContent: {
    flex: 1,
  },
  creativeTimelinePeriod: {
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 1,
  },
  creativeTimelineTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  creativeTimelineSubtitle: {
    fontSize: 9,
    color: "#374151",
  },
  creativeTimelineTask: {
    fontSize: 8.5,
    color: "#374151",
    marginTop: 2,
    marginLeft: 21,
  },
  creativeLetterBody: {
    width: "66%",
    paddingVertical: 32,
    paddingHorizontal: 28,
  },
  creativeSectionHeadingLetter: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },
  creativeParagraph: {
    marginBottom: 7,
  },
});

function isAllCapsHeading(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length < 40 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-ZÄÖÜ]/.test(trimmed)
  );
}

function stripPersonalData(text: string, profile: ProfileData): string {
  const tokens: string[] = [];
  if (profile.name) tokens.push(...profile.name.split(/\s+/).filter(Boolean));
  if (profile.address) tokens.push(...profile.address.split(/[,\s]+/).filter((t) => t.length > 2));
  if (profile.email) tokens.push(profile.email);
  if (profile.phone) tokens.push(profile.phone.replace(/\s+/g, ""));
  if (profile.birthdate) {
    tokens.push(profile.birthdate);
    const d = formatDate(profile.birthdate);
    if (d) tokens.push(d);
  }
  if (tokens.length === 0) return text;

  const lines = text.split("\n");
  let firstContentLine = 0;
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i].trim();
    if (!line) { firstContentLine = i + 1; continue; }
    const lower = line.toLowerCase();
    const matches = tokens.some((t) => lower.includes(t.toLowerCase()));
    if (matches && line.length < 120) {
      firstContentLine = i + 1;
    } else {
      break;
    }
  }
  const result = lines.slice(firstContentLine).join("\n").trim();
  return result.length > 20 ? result : text;
}

const GREETING_RE = /^(mit\s+freundlichen\s+gr[üu][ßs]en|herzliche\s+gr[üu][ßs]e|best\s+regards|viele\s+gr[üu][ßs]e|freundliche\s+gr[üu][ßs]e)/i;
const DATE_LINE_RE = /^[A-ZÄÖÜ][a-zäöüß]+,?\s+(den\s+)?\d{1,2}\.\s?\d{1,2}\.\s?\d{2,4}/;
const SUBJECT_RE = /^Bewerbung\s+(als|um|für)\s/i;

function needsDoubleSpacing(trimmed: string): boolean {
  return GREETING_RE.test(trimmed) || DATE_LINE_RE.test(trimmed) || SUBJECT_RE.test(trimmed);
}

function renderTextBlocks(text: string, variant: "classic" | "modern" | "traditional" | "accent" | "creative" = "classic") {
  const headingStyle =
    variant === "modern" ? styles.modernSectionHeading
    : variant === "traditional" ? styles.traditionalSectionHeading
    : variant === "accent" ? styles.accentSectionHeadingLetter
    : variant === "creative" ? styles.creativeSectionHeadingLetter
    : styles.sectionHeading;
  const paragraphStyle =
    variant === "modern" ? styles.modernParagraph
    : variant === "traditional" ? styles.traditionalParagraph
    : variant === "accent" ? styles.accentParagraph
    : variant === "creative" ? styles.creativeParagraph
    : styles.paragraph;

  const applySpacing = variant !== "traditional";

  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const extraMargin = applySpacing && i > 0 && needsDoubleSpacing(trimmed) ? { marginTop: 14 } : undefined;
    if (isAllCapsHeading(trimmed)) {
      return (
        <Text key={i} style={extraMargin ? { ...headingStyle, ...extraMargin } : headingStyle}>
          {trimmed}
        </Text>
      );
    }
    return (
      <Text key={i} style={extraMargin ? { ...paragraphStyle, ...extraMargin } : paragraphStyle}>
        {trimmed}
      </Text>
    );
  });
}

function SkillBar({ label, value }: SkillItem) {
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillLabel}>{label}</Text>
      <View style={styles.skillBarBg}>
        <View
          style={{ ...styles.skillBarFill, width: `${value}%` }}
          {...{ "data-testid": "skill-bar-fill" }}
        />
      </View>
    </View>
  );
}

function ModernSidebar({ profile, sidebarBg }: { profile: ProfileData; sidebarBg?: string }) {
  return (
    <View style={{ ...styles.modernSidebar, backgroundColor: sidebarBg ?? SIDEBAR_BG }} {...{ "data-testid": "modern-sidebar" }}>
      {profile.photo ? (
        <Image src={profile.photo} style={styles.modernSidebarPhoto} />
      ) : null}
      <Text style={styles.modernSidebarName}>{profile.name}</Text>
      {profile.address ? (
        <Text style={styles.modernSidebarMeta}>{profile.address}</Text>
      ) : null}
      {profile.email ? (
        <Text style={styles.modernSidebarMeta}>{profile.email}</Text>
      ) : null}
      {profile.phone ? (
        <Text style={styles.modernSidebarMeta}>{profile.phone}</Text>
      ) : null}
    </View>
  );
}

function TraditionalHeader({ profile, documentLabel }: { profile: ProfileData; documentLabel: string }) {
  const birthFormatted = profile.birthdate ? formatDate(profile.birthdate) : null;
  return (
    <View style={styles.traditionalHeader} {...{ "data-testid": "traditional-header" }}>
      <View style={styles.traditionalHeaderLeft}>
        <Text style={styles.traditionalDocumentLabel}>{documentLabel}</Text>
        <Text style={styles.traditionalName}>{profile.name}</Text>
        {profile.address ? <Text style={styles.traditionalMeta}>{profile.address}</Text> : null}
        {birthFormatted ? <Text style={styles.traditionalMeta}>Geb. {birthFormatted}</Text> : null}
        {profile.email ? <Text style={styles.traditionalMeta}>{profile.email}</Text> : null}
        {profile.phone ? <Text style={styles.traditionalMeta}>{profile.phone}</Text> : null}
      </View>
      {profile.photo ? <Image src={profile.photo} style={styles.traditionalPhoto} /> : null}
    </View>
  );
}

function formatDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return iso;
}

function lightenColor(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function AccentBanner({ profile, accentColor }: { profile: ProfileData; accentColor: string }) {
  const lightColor = lightenColor(accentColor, 0.65);
  return (
    <View style={styles.accentBannerWrap} {...{ "data-testid": "accent-banner" }}>
      <Svg style={styles.accentBannerSvg} viewBox="0 0 600 130">
        <Defs>
          <LinearGradient id="accentBannerGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={lightColor} />
            <Stop offset="1" stopColor={accentColor} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="600" height="130" fill="url(#accentBannerGradient)" />
      </Svg>
      {profile.photo ? <Image src={profile.photo} style={styles.accentBannerPhoto} /> : null}
    </View>
  );
}

function AccentNameBand({ profile, accentColor }: { profile: ProfileData; accentColor: string }) {
  return (
    <View style={{ ...styles.accentNameBand, backgroundColor: accentColor }} {...{ "data-testid": "accent-name-band" }}>
      <Text style={styles.accentName}>{profile.name}</Text>
    </View>
  );
}

function AccentTimelineEntry({
  period,
  title,
  subtitle,
  tasks,
  accentColor,
  testId,
}: {
  period: string;
  title: string;
  subtitle: string;
  tasks?: string[];
  accentColor: string;
  testId: string;
}) {
  return (
    <View wrap={false} style={styles.accentTimelineEntry} {...{ "data-testid": testId }}>
      <Text style={{ ...styles.accentTimelineMarker, color: accentColor }}>{">"}</Text>
      <View style={styles.accentTimelineContent}>
        <Text style={styles.accentTimelinePeriod}>{period}</Text>
        <Text style={{ ...styles.accentTimelineTitle, color: accentColor }}>{title}</Text>
        <Text style={styles.accentTimelineSubtitle}>{subtitle}</Text>
        {tasks?.map((line, j) => (
          <Text key={j} style={styles.accentTimelineTask}>• {line}</Text>
        ))}
      </View>
    </View>
  );
}

function AccentInfoBar({ profile }: { profile: ProfileData }) {
  const birthFormatted = profile.birthdate ? formatDate(profile.birthdate) : null;
  return (
    <View style={styles.accentInfoBar}>
      {birthFormatted ? (
        <View style={styles.accentInfoCell}>
          <Text style={styles.accentInfoText}>Geb. {birthFormatted}</Text>
        </View>
      ) : null}
      {profile.address ? (
        <View style={styles.accentInfoCell}>
          <Text style={styles.accentInfoText}>{profile.address}</Text>
        </View>
      ) : null}
      {profile.email || profile.phone ? (
        <View style={styles.accentInfoCell}>
          {profile.email ? <Text style={styles.accentInfoText}>{profile.email}</Text> : null}
          {profile.phone ? <Text style={styles.accentInfoText}>{profile.phone}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function splitTasks(tasks: string): string[] {
  return tasks
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

type CreativeIconKind = "location" | "email" | "phone" | "star" | "heart" | "briefcase" | "graduation";

const CREATIVE_ICON_CONFIG: Record<CreativeIconKind, { paths: string[]; rect?: { x: number; y: number; width: number; height: number; rx: number } }> = {
  location: { paths: ["M8 1C5.24 1 3 3.24 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-2.76-2.24-5-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"] },
  email: { paths: ["M2 4l6 5 6-5"], rect: { x: 1, y: 3, width: 14, height: 10, rx: 1 } },
  phone: { paths: ["M3 2c-.5 0-1 .4-1 1 0 6 5 11 11 11 .5 0 1-.4 1-1v-2.4c0-.4-.3-.8-.7-.9l-2.4-.6c-.3-.1-.7 0-.9.3l-.8 1c-1.6-.9-2.9-2.2-3.8-3.8l1-.8c.3-.2.4-.6.3-.9L6.1 2.7C6 2.3 5.6 2 5.2 2H3z"] },
  star: { paths: ["M8 1l2.2 4.6 5 .7-3.6 3.5.9 5L8 12.4l-4.5 2.4.9-5L0.8 6.3l5-.7z"] },
  heart: { paths: ["M8 14s-6-4-6-8c0-2 1.5-3.5 3.5-3.5C7 2.5 8 4 8 4s1-1.5 2.5-1.5C12.5 2.5 14 4 14 6c0 4-6 8-6 8z"] },
  briefcase: { paths: ["M5.5 5.5V4c0-.6.4-1 1-1h3c.6 0 1 .4 1 1v1.5"], rect: { x: 2, y: 5.5, width: 12, height: 8, rx: 1 } },
  graduation: { paths: ["M8 2L1 6l7 4 7-4-7-4zM4 8.5V12l4 2 4-2V8.5L8 10.5 4 8.5z"] },
};

function CreativeIcon({ kind, color = "#ffffff", size = 11 }: { kind: CreativeIconKind; color?: string; size?: number }) {
  const { paths, rect } = CREATIVE_ICON_CONFIG[kind];
  return (
    <Svg viewBox="0 0 16 16" style={{ width: size, height: size }} {...{ "data-testid": `creative-icon-${kind}` }}>
      {rect ? <Rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={rect.rx} fill="none" stroke={color} strokeWidth={1.3} /> : null}
      {paths.map((d, i) => (
        <Path key={i} d={d} fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

function CreativeSkillBar({ label, value, kind }: SkillItem & { kind: CreativeIconKind }) {
  return (
    <View style={styles.creativeSkillItem}>
      <View style={styles.creativeSkillLabelRow}>
        <View style={styles.creativeSkillIcon}>
          <CreativeIcon kind={kind} size={10} />
        </View>
        <Text style={styles.creativeSkillLabel}>{label}</Text>
      </View>
      <View style={styles.creativeSkillBarBg}>
        <View
          style={{ ...styles.creativeSkillBarFill, width: `${value}%` }}
          {...{ "data-testid": "skill-bar-fill" }}
        />
      </View>
    </View>
  );
}

function CreativeSidebar({
  profile,
  accentColor,
  children,
}: {
  profile: ProfileData;
  accentColor: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={{ ...styles.creativeSidebar, backgroundColor: accentColor }} {...{ "data-testid": "creative-sidebar" }}>
      {profile.photo ? (
        <Image src={profile.photo} style={styles.creativeSidebarPhoto} />
      ) : null}
      <Text style={styles.creativeSidebarName}>{profile.name}</Text>

      <View style={styles.creativeSidebarSection}>
        <Text style={styles.creativeSidebarSectionTitle}>Kontakt</Text>
        {profile.address ? (
          <View style={styles.creativeContactRow}>
            <View style={styles.creativeContactIcon}>
              <CreativeIcon kind="location" size={11} />
            </View>
            <Text style={styles.creativeContactText}>{profile.address}</Text>
          </View>
        ) : null}
        {profile.email ? (
          <View style={styles.creativeContactRow}>
            <View style={styles.creativeContactIcon}>
              <CreativeIcon kind="email" size={11} />
            </View>
            <Text style={styles.creativeContactText}>{profile.email}</Text>
          </View>
        ) : null}
        {profile.phone ? (
          <View style={styles.creativeContactRow}>
            <View style={styles.creativeContactIcon}>
              <CreativeIcon kind="phone" size={11} />
            </View>
            <Text style={styles.creativeContactText}>{profile.phone}</Text>
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );
}

function CreativeTimelineEntry({
  period,
  title,
  subtitle,
  tasks,
  icon,
  testId,
}: {
  period: string;
  title: string;
  subtitle: string;
  tasks?: string[];
  icon: CreativeIconKind;
  testId: string;
}) {
  return (
    <View wrap={false} style={styles.creativeTimelineEntry} {...{ "data-testid": testId }}>
      <View style={styles.creativeTimelineIcon}>
        <CreativeIcon kind={icon} color="#374151" size={13} />
      </View>
      <View style={styles.creativeTimelineContent}>
        <Text style={styles.creativeTimelinePeriod}>{period}</Text>
        <Text style={styles.creativeTimelineTitle}>{title}</Text>
        <Text style={styles.creativeTimelineSubtitle}>{subtitle}</Text>
        {tasks?.map((line, j) => (
          <Text key={j} style={styles.creativeTimelineTask}>• {line}</Text>
        ))}
      </View>
    </View>
  );
}

interface CoverLetterDocumentProps {
  coverLetter: string;
  profile: ProfileData;
  template?: "classic" | "modern" | "traditional" | "accent" | "creative";
  accentColor?: string;
}

export function CoverLetterDocument({ coverLetter, profile, template = "classic", accentColor }: CoverLetterDocumentProps) {
  if (template === "modern") {
    const sidebarBg = accentColor ?? SIDEBAR_BG;
    return (
      <Document>
        <Page size="A4" style={styles.modernPage}>
          <ModernSidebar profile={profile} sidebarBg={sidebarBg} />
          <View style={styles.modernContent} {...{ "data-testid": "modern-content" }}>
            <Text style={styles.documentLabel}>Anschreiben</Text>
            {renderTextBlocks(stripPersonalData(coverLetter, profile), "modern")}
          </View>
        </Page>
      </Document>
    );
  }

  if (template === "traditional") {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
    return (
      <Document>
        <Page size="A4" style={styles.traditionalPage}>
          <TraditionalHeader profile={profile} documentLabel="Anschreiben" />
          <View style={styles.traditionalRecipientBlock} {...{ "data-testid": "traditional-recipient" }} />
          <View {...{ "data-testid": "traditional-date" }}>
            <Text style={styles.traditionalDateRow}>{dateStr}</Text>
          </View>
          <View {...{ "data-testid": "traditional-subject" }}>
            <Text style={styles.traditionalSubject}>Betreff: Bewerbung</Text>
          </View>
          <View>{renderTextBlocks(stripPersonalData(coverLetter, profile), "traditional")}</View>
        </Page>
      </Document>
    );
  }

  if (template === "accent") {
    const color = accentColor ?? SIDEBAR_BG;
    return (
      <Document>
        <Page size="A4" style={styles.accentPage}>
          <AccentBanner profile={profile} accentColor={color} />
          <AccentNameBand profile={profile} accentColor={color} />
          <View style={styles.accentBewerbungBand} {...{ "data-testid": "accent-bewerbung-band" }}>
            <View style={{ ...styles.accentStripe, backgroundColor: color }} />
            <Text style={styles.accentBewerbungText}>Bewerbung</Text>
            <View style={{ ...styles.accentStripe, backgroundColor: color }} />
          </View>
          <View style={styles.accentLetterBody}>{renderTextBlocks(coverLetter, "accent")}</View>
        </Page>
      </Document>
    );
  }

  if (template === "creative") {
    const color = accentColor ?? SIDEBAR_BG;
    return (
      <Document>
        <Page size="A4" style={styles.creativePage}>
          <CreativeSidebar profile={profile} accentColor={color} />
          <View style={styles.creativeLetterBody}>{renderTextBlocks(coverLetter, "creative")}</View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
        <Text style={styles.documentLabel}>Anschreiben</Text>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.meta}>{profile.address}</Text> : null}
        </View>
        <View>{renderTextBlocks(stripPersonalData(coverLetter, profile))}</View>
      </Page>
    </Document>
  );
}

interface CvDocumentProps {
  cv: string;
  profile: ProfileData;
  template?: "classic" | "modern" | "traditional" | "accent" | "creative";
  cvStyle?: "classic" | "american";
  accentColor?: string;
}

export function CvDocument({ cv, profile, template = "classic", cvStyle, accentColor }: CvDocumentProps) {
  if (template === "modern") {
    const headerBg = accentColor ?? SIDEBAR_BG;
    const birthFormatted = profile.birthdate ? formatDate(profile.birthdate) : null;
    const education = cvStyle === "american" ? [...profile.education].reverse() : profile.education;
    const experience = cvStyle === "american" ? [...profile.experience].reverse() : profile.experience;
    return (
      <Document>
        <Page size="A4" style={styles.cvModernPage}>
          {/* Header: circle photo + name */}
          <View style={{ ...styles.cvNameBar, backgroundColor: headerBg }} {...{ "data-testid": "modern-cv-header" }}>
            {profile.photo ? (
              <Image src={profile.photo} style={styles.cvHeaderPhoto} />
            ) : null}
            <Text style={styles.cvHeaderName}>{profile.name}</Text>
          </View>

          {/* Info bar */}
          <View style={styles.cvInfoBar}>
            {birthFormatted ? (
              <View style={styles.cvInfoCell}>
                <Text style={styles.cvInfoText}>Geb. {birthFormatted}</Text>
              </View>
            ) : null}
            {profile.address ? (
              <View style={styles.cvInfoCell}>
                <Text style={styles.cvInfoText}>{profile.address}</Text>
              </View>
            ) : null}
            {(profile.email || profile.phone) ? (
              <View style={styles.cvInfoCell}>
                {profile.email ? <Text style={styles.cvInfoText}>{profile.email}</Text> : null}
                {profile.phone ? <Text style={styles.cvInfoText}>{profile.phone}</Text> : null}
              </View>
            ) : null}
          </View>

          {/* Two-column content */}
          <View style={styles.cvTwoColumns}>
            {/* Left column: structured profile data */}
            <View style={styles.cvLeftCol} {...{ "data-testid": "modern-content" }}>
              <Text style={styles.documentLabel}>Lebenslauf</Text>

              {experience?.length > 0 && (
                <>
                  <Text style={styles.cvSectionHeading} minPresenceAhead={40}>Berufserfahrung</Text>
                  {experience.map((exp, i) => (
                    <View key={i} wrap={false} style={styles.cvExpEntry} {...{ "data-testid": "modern-exp-entry" }}>
                      <Text style={styles.cvExpPeriod}>{exp.period}</Text>
                      <Text style={styles.cvExpPosition}>{exp.position}</Text>
                      <Text style={styles.cvExpCompany}>{exp.company}</Text>
                      {exp.tasks
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0)
                        .map((line, j) => (
                          <Text key={j} style={styles.cvExpTask}>• {line}</Text>
                        ))}
                    </View>
                  ))}
                </>
              )}

              {education?.length > 0 && (
                <>
                  <Text style={styles.cvSectionHeading} minPresenceAhead={40}>Ausbildung</Text>
                  {education.map((edu, i) => (
                    <View key={i} wrap={false} style={styles.cvEduEntry} {...{ "data-testid": "modern-edu-entry" }}>
                      <Text style={styles.cvEduYear}>{edu.year}</Text>
                      <Text style={styles.cvEduDegree}>{edu.degree}</Text>
                      <Text style={styles.cvEduInstitution}>{edu.institution}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>

            {/* Right column: skills + interests */}
            <View style={styles.cvRightCol}>
              {profile.qualifications?.length > 0 && (
                <View {...{ "data-testid": "modern-cv-quals" }}>
                  <Text style={styles.cvSectionHeading}>Qualifikationen</Text>
                  {profile.qualifications.map((q, i) => (
                    <SkillBar key={i} label={q.label} value={q.value} />
                  ))}
                </View>
              )}
              {profile.interests?.length > 0 && (
                <View {...{ "data-testid": "modern-cv-interests" }}>
                  <Text style={styles.cvSectionHeading}>Persönliche Interessen</Text>
                  {profile.interests.map((interest, i) => (
                    <SkillBar key={i} label={interest.label} value={interest.value} />
                  ))}
                </View>
              )}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (template === "traditional") {
    const education = cvStyle === "american" ? [...profile.education].reverse() : profile.education;
    const experience = cvStyle === "american" ? [...profile.experience].reverse() : profile.experience;
    return (
      <Document>
        <Page size="A4" style={styles.traditionalPage}>
          <TraditionalHeader profile={profile} documentLabel="Lebenslauf" />

          {experience?.length > 0 && (
            <>
              <Text style={styles.traditionalSectionHeading} minPresenceAhead={40}>Berufserfahrung</Text>
              <View style={styles.traditionalTable} {...{ "data-testid": "traditional-exp-table" }}>
                {experience.map((exp, i) => (
                  <View key={i} wrap={false} style={styles.traditionalTableRow} {...{ "data-testid": "traditional-exp-row" }}>
                    <Text style={styles.traditionalCellPeriod}>{exp.period}</Text>
                    <View style={styles.traditionalCellContent}>
                      <Text style={styles.traditionalCellTitle}>{exp.position}</Text>
                      <Text style={styles.traditionalCellSubtitle}>{exp.company}</Text>
                      {exp.tasks
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line.length > 0)
                        .map((line, j) => (
                          <Text key={j} style={styles.traditionalCellTask}>• {line}</Text>
                        ))}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {education?.length > 0 && (
            <>
              <Text style={styles.traditionalSectionHeading} minPresenceAhead={40}>Ausbildung</Text>
              <View style={styles.traditionalTable} {...{ "data-testid": "traditional-edu-table" }}>
                {education.map((edu, i) => (
                  <View key={i} wrap={false} style={styles.traditionalTableRow} {...{ "data-testid": "traditional-edu-row" }}>
                    <Text style={styles.traditionalCellPeriod}>{edu.year}</Text>
                    <View style={styles.traditionalCellContent}>
                      <Text style={styles.traditionalCellTitle}>{edu.degree}</Text>
                      <Text style={styles.traditionalCellSubtitle}>{edu.institution}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {profile.qualifications?.length > 0 && (
            <View wrap={false} {...{ "data-testid": "traditional-quals" }}>
              <Text style={styles.traditionalSectionHeading}>Qualifikationen</Text>
              {profile.qualifications.map((q, i) => (
                <Text key={i} style={styles.traditionalListItem}>• {q.label}</Text>
              ))}
            </View>
          )}

          {profile.interests?.length > 0 && (
            <View wrap={false} {...{ "data-testid": "traditional-interests" }}>
              <Text style={styles.traditionalSectionHeading}>Interessen</Text>
              {profile.interests.map((interest, i) => (
                <Text key={i} style={styles.traditionalListItem}>• {interest.label}</Text>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  if (template === "accent") {
    const color = accentColor ?? SIDEBAR_BG;
    const education: EducationEntry[] = cvStyle === "american" ? [...profile.education].reverse() : profile.education;
    const experience: ExperienceEntry[] = cvStyle === "american" ? [...profile.experience].reverse() : profile.experience;
    return (
      <Document>
        <Page size="A4" style={styles.accentPage}>
          <AccentBanner profile={profile} accentColor={color} />
          <AccentNameBand profile={profile} accentColor={color} />
          <AccentInfoBar profile={profile} />

          <View style={styles.accentTwoColumns}>
            <View style={styles.accentLeftCol} {...{ "data-testid": "accent-content" }}>
              {experience?.length > 0 && (
                <>
                  <Text style={{ ...styles.accentSectionHeading, color }} minPresenceAhead={40}>Berufserfahrung</Text>
                  {experience.map((exp, i) => (
                    <AccentTimelineEntry
                      key={i}
                      period={exp.period}
                      title={exp.company}
                      subtitle={exp.position}
                      tasks={splitTasks(exp.tasks)}
                      accentColor={color}
                      testId="accent-exp-entry"
                    />
                  ))}
                </>
              )}

              {education?.length > 0 && (
                <>
                  <Text style={{ ...styles.accentSectionHeading, color }} minPresenceAhead={40}>Ausbildung</Text>
                  {education.map((edu, i) => (
                    <AccentTimelineEntry
                      key={i}
                      period={edu.year}
                      title={edu.degree}
                      subtitle={edu.institution}
                      accentColor={color}
                      testId="accent-edu-entry"
                    />
                  ))}
                </>
              )}
            </View>

            <View style={styles.accentRightCol}>
              {profile.qualifications?.length > 0 && (
                <View {...{ "data-testid": "accent-cv-quals" }}>
                  <Text style={{ ...styles.accentSectionHeading, color }}>Qualifikationen</Text>
                  {profile.qualifications.map((q, i) => (
                    <SkillBar key={i} label={q.label} value={q.value} />
                  ))}
                </View>
              )}
              {profile.interests?.length > 0 && (
                <View {...{ "data-testid": "accent-cv-interests" }}>
                  <Text style={{ ...styles.accentSectionHeading, color }}>Persönliche Interessen</Text>
                  {profile.interests.map((interest, i) => (
                    <SkillBar key={i} label={interest.label} value={interest.value} />
                  ))}
                </View>
              )}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (template === "creative") {
    const color = accentColor ?? SIDEBAR_BG;
    const education: EducationEntry[] = cvStyle === "american" ? [...profile.education].reverse() : profile.education;
    const experience: ExperienceEntry[] = cvStyle === "american" ? [...profile.experience].reverse() : profile.experience;
    return (
      <Document>
        <Page size="A4" style={styles.creativePage}>
          <CreativeSidebar profile={profile} accentColor={color}>
            {profile.qualifications?.length > 0 && (
              <View style={styles.creativeSidebarSection} {...{ "data-testid": "creative-cv-quals" }}>
                <Text style={styles.creativeSidebarSectionTitle}>Qualifikationen</Text>
                {profile.qualifications.map((q, i) => (
                  <CreativeSkillBar key={i} label={q.label} value={q.value} kind="star" />
                ))}
              </View>
            )}
            {profile.interests?.length > 0 && (
              <View style={styles.creativeSidebarSection} {...{ "data-testid": "creative-cv-interests" }}>
                <Text style={styles.creativeSidebarSectionTitle}>Persönliche Interessen</Text>
                {profile.interests.map((interest, i) => (
                  <CreativeSkillBar key={i} label={interest.label} value={interest.value} kind="heart" />
                ))}
              </View>
            )}
          </CreativeSidebar>

          <View style={styles.creativeMain} {...{ "data-testid": "creative-content" }}>
            <Text style={styles.creativeMainName}>{profile.name}</Text>

            {experience?.length > 0 && (
              <>
                <View minPresenceAhead={40} style={styles.creativeSectionHeading}>
                  <View style={styles.creativeSectionHeadingIcon}>
                    <CreativeIcon kind="briefcase" color={color} size={14} />
                  </View>
                  <Text style={{ ...styles.creativeSectionHeadingText, color }}>Berufserfahrung</Text>
                </View>
                {experience.map((exp, i) => (
                  <CreativeTimelineEntry
                    key={i}
                    period={exp.period}
                    title={exp.company}
                    subtitle={exp.position}
                    tasks={splitTasks(exp.tasks)}
                    icon="briefcase"
                    testId="creative-exp-entry"
                  />
                ))}
              </>
            )}

            {education?.length > 0 && (
              <>
                <View minPresenceAhead={40} style={styles.creativeSectionHeading}>
                  <View style={styles.creativeSectionHeadingIcon}>
                    <CreativeIcon kind="graduation" color={color} size={14} />
                  </View>
                  <Text style={{ ...styles.creativeSectionHeadingText, color }}>Ausbildung</Text>
                </View>
                {education.map((edu, i) => (
                  <CreativeTimelineEntry
                    key={i}
                    period={edu.year}
                    title={edu.degree}
                    subtitle={edu.institution}
                    icon="graduation"
                    testId="creative-edu-entry"
                  />
                ))}
              </>
            )}
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
        <Text style={styles.documentLabel}>Lebenslauf</Text>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.meta}>{profile.address}</Text> : null}
        </View>
        <View>{renderTextBlocks(stripPersonalData(cv, profile))}</View>
      </Page>
    </Document>
  );
}
