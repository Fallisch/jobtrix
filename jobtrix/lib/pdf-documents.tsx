import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Svg, Defs, LinearGradient, Stop, Rect } from "@react-pdf/renderer";
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
    flex: 1,
  },
  cvLeftCol: {
    flex: 55,
    paddingLeft: 36,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 20,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  cvRightCol: {
    flex: 45,
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
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  traditionalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
    marginBottom: 24,
    minHeight: 60,
  },
  traditionalDateRow: {
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 14,
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
    flex: 1,
  },
  accentLeftCol: {
    flex: 58,
    paddingLeft: 36,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 20,
  },
  accentRightCol: {
    flex: 42,
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
    paddingTop: 24,
    paddingBottom: 40,
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

function renderTextBlocks(text: string, variant: "classic" | "modern" | "traditional" | "accent" = "classic") {
  const headingStyle =
    variant === "modern" ? styles.modernSectionHeading
    : variant === "traditional" ? styles.traditionalSectionHeading
    : variant === "accent" ? styles.accentSectionHeadingLetter
    : styles.sectionHeading;
  const paragraphStyle =
    variant === "modern" ? styles.modernParagraph
    : variant === "traditional" ? styles.traditionalParagraph
    : variant === "accent" ? styles.accentParagraph
    : styles.paragraph;

  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (isAllCapsHeading(trimmed)) {
      return (
        <Text key={i} style={headingStyle}>
          {trimmed}
        </Text>
      );
    }
    return (
      <Text key={i} style={paragraphStyle}>
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
    <View style={styles.accentTimelineEntry} {...{ "data-testid": testId }}>
      <Text style={{ ...styles.accentTimelineMarker, color: accentColor }}>▶</Text>
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

interface CoverLetterDocumentProps {
  coverLetter: string;
  profile: ProfileData;
  template?: "classic" | "modern" | "traditional" | "accent";
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
            {renderTextBlocks(coverLetter, "modern")}
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
          <View>{renderTextBlocks(coverLetter, "traditional")}</View>
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
        <Text style={styles.documentLabel}>Anschreiben</Text>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.meta}>{profile.address}</Text> : null}
        </View>
        <View>{renderTextBlocks(coverLetter)}</View>
      </Page>
    </Document>
  );
}

interface CvDocumentProps {
  cv: string;
  profile: ProfileData;
  template?: "classic" | "modern" | "traditional" | "accent";
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
              <Text style={styles.cvSectionHeading}>Persönliche Daten</Text>
              {birthFormatted ? (
                <View style={styles.cvDataRow}>
                  <Text style={styles.cvDataLabel}>Geburtsdatum</Text>
                  <Text style={styles.cvDataValue}>{birthFormatted}</Text>
                </View>
              ) : null}
              {profile.address ? (
                <View style={styles.cvDataRow}>
                  <Text style={styles.cvDataLabel}>Adresse</Text>
                  <Text style={styles.cvDataValue}>{profile.address}</Text>
                </View>
              ) : null}
              {profile.email ? (
                <View style={styles.cvDataRow}>
                  <Text style={styles.cvDataLabel}>E-Mail</Text>
                  <Text style={styles.cvDataValue}>{profile.email}</Text>
                </View>
              ) : null}
              {profile.phone ? (
                <View style={styles.cvDataRow}>
                  <Text style={styles.cvDataLabel}>Telefon</Text>
                  <Text style={styles.cvDataValue}>{profile.phone}</Text>
                </View>
              ) : null}

              {experience?.length > 0 && (
                <>
                  <Text style={styles.cvSectionHeading}>Berufserfahrung</Text>
                  {experience.map((exp, i) => (
                    <View key={i} style={styles.cvExpEntry} {...{ "data-testid": "modern-exp-entry" }}>
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
                  <Text style={styles.cvSectionHeading}>Ausbildung</Text>
                  {education.map((edu, i) => (
                    <View key={i} style={styles.cvEduEntry} {...{ "data-testid": "modern-edu-entry" }}>
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
              <Text style={styles.traditionalSectionHeading}>Berufserfahrung</Text>
              <View style={styles.traditionalTable} {...{ "data-testid": "traditional-exp-table" }}>
                {experience.map((exp, i) => (
                  <View key={i} style={styles.traditionalTableRow} {...{ "data-testid": "traditional-exp-row" }}>
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
              <Text style={styles.traditionalSectionHeading}>Ausbildung</Text>
              <View style={styles.traditionalTable} {...{ "data-testid": "traditional-edu-table" }}>
                {education.map((edu, i) => (
                  <View key={i} style={styles.traditionalTableRow} {...{ "data-testid": "traditional-edu-row" }}>
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
            <>
              <Text style={styles.traditionalSectionHeading}>Qualifikationen</Text>
              <View {...{ "data-testid": "traditional-quals" }}>
                {profile.qualifications.map((q, i) => (
                  <Text key={i} style={styles.traditionalListItem}>• {q.label}</Text>
                ))}
              </View>
            </>
          )}

          {profile.interests?.length > 0 && (
            <>
              <Text style={styles.traditionalSectionHeading}>Interessen</Text>
              <View {...{ "data-testid": "traditional-interests" }}>
                {profile.interests.map((interest, i) => (
                  <Text key={i} style={styles.traditionalListItem}>• {interest.label}</Text>
                ))}
              </View>
            </>
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
                  <Text style={{ ...styles.accentSectionHeading, color }}>Berufserfahrung</Text>
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
                  <Text style={{ ...styles.accentSectionHeading, color }}>Ausbildung</Text>
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
        <Text style={styles.documentLabel}>Lebenslauf</Text>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.meta}>{profile.address}</Text> : null}
        </View>
        <View>{renderTextBlocks(cv)}</View>
      </Page>
    </Document>
  );
}
