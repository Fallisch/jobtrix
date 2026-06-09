import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { ProfileData, SkillItem } from "@/lib/profile-storage";

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

function renderTextBlocks(text: string, modernStyle = false) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (isAllCapsHeading(trimmed)) {
      return (
        <Text key={i} style={modernStyle ? styles.modernSectionHeading : styles.sectionHeading}>
          {trimmed}
        </Text>
      );
    }
    return (
      <Text key={i} style={modernStyle ? styles.modernParagraph : styles.paragraph}>
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

function formatDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return iso;
}

interface CoverLetterDocumentProps {
  coverLetter: string;
  profile: ProfileData;
  template?: "classic" | "modern";
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
            {renderTextBlocks(coverLetter, true)}
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
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
  template?: "classic" | "modern";
  cvStyle?: "classic" | "american";
  accentColor?: string;
}

export function CvDocument({ cv, profile, template = "classic", cvStyle, accentColor }: CvDocumentProps) {
  if (template === "modern") {
    const headerBg = accentColor ?? SIDEBAR_BG;
    const birthFormatted = profile.birthdate ? formatDate(profile.birthdate) : null;
    const education = cvStyle === "american" ? [...profile.education].reverse() : profile.education;
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} />
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.meta}>{profile.address}</Text> : null}
        </View>
        <View>{renderTextBlocks(cv)}</View>
      </Page>
    </Document>
  );
}
