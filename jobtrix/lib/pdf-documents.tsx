import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { ProfileData } from "@/lib/profile-storage";

const ACCENT = "#2F80ED";
const PRIMARY = "#1E3A5F";
const SIDEBAR_BG = "#1E3A5F";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    paddingTop: 52,
    paddingBottom: 52,
    paddingHorizontal: 60,
    color: "#1a1a1a",
    lineHeight: 1.5,
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
    marginBottom: 24,
    paddingBottom: 16,
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
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },
  // Cover letter Modern layout (left dark sidebar)
  modernPage: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.5,
    flexDirection: "row",
  },
  modernSidebar: {
    width: "35%",
    backgroundColor: SIDEBAR_BG,
    padding: 24,
    color: "#ffffff",
    minHeight: "100%",
  },
  modernSidebarName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 4,
    marginTop: 8,
  },
  modernSidebarMeta: {
    fontSize: 9,
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
    width: "65%",
    padding: 36,
  },
  modernParagraph: {
    marginBottom: 8,
  },
  modernSectionHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#d1d5db",
  },
  // CV Modern layout (Beispiel-Layout style)
  cvModernPage: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  cvPhoto: {
    width: "100%",
    height: 160,
    objectFit: "cover",
  },
  cvHeader: {
    backgroundColor: SIDEBAR_BG,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  cvHeaderName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cvHeaderMeta: {
    fontSize: 9,
    color: "#cbd5e1",
    marginTop: 4,
  },
  cvColumns: {
    flexDirection: "row",
    flex: 1,
  },
  cvMainColumn: {
    width: "57%",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 40,
    paddingRight: 16,
  },
  cvDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  cvSideColumn: {
    width: "40%",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 32,
  },
  cvSideHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: 10,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  skillRow: {
    marginBottom: 7,
  },
  skillLabel: {
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 3,
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

function SkillBar({ label }: { label: string }) {
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillLabel}>{label}</Text>
      <View style={styles.skillBarBg}>
        <View style={styles.skillBarFill} />
      </View>
    </View>
  );
}

function ModernSidebar({ profile }: { profile: ProfileData }) {
  return (
    <View style={styles.modernSidebar} {...{ "data-testid": "modern-sidebar" }}>
      {profile.photo ? (
        <Image src={profile.photo} style={styles.modernSidebarPhoto} />
      ) : null}
      <Text style={styles.modernSidebarName}>{profile.name}</Text>
      {profile.address ? (
        <Text style={styles.modernSidebarMeta}>{profile.address}</Text>
      ) : null}
    </View>
  );
}

interface CoverLetterDocumentProps {
  coverLetter: string;
  profile: ProfileData;
  template?: "classic" | "modern";
}

export function CoverLetterDocument({ coverLetter, profile, template = "classic" }: CoverLetterDocumentProps) {
  if (template === "modern") {
    return (
      <Document>
        <Page size="A4" style={styles.modernPage}>
          <ModernSidebar profile={profile} />
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
}

export function CvDocument({ cv, profile, template = "classic" }: CvDocumentProps) {
  if (template === "modern") {
    return (
      <Document>
        <Page size="A4" style={styles.cvModernPage}>
          <View style={styles.cvHeader} {...{ "data-testid": "modern-cv-header" }}>
            {profile.photo ? (
              <Image src={profile.photo} style={styles.modernSidebarPhoto} />
            ) : null}
            <Text style={styles.cvHeaderName}>{profile.name}</Text>
            {profile.address ? (
              <Text style={styles.cvHeaderMeta}>{profile.address}</Text>
            ) : null}
          </View>
          <View style={styles.cvColumns}>
            <View style={styles.cvMainColumn} {...{ "data-testid": "modern-content" }}>
              {renderTextBlocks(cv, true)}
            </View>
            <View style={styles.cvDivider} />
            <View style={styles.cvSideColumn}>
              {profile.qualifications?.length > 0 && (
                <View {...{ "data-testid": "modern-cv-quals" }}>
                  <Text style={styles.cvSideHeading}>Qualifikationen</Text>
                  {profile.qualifications.map((q, i) => (
                    <SkillBar key={i} label={q} />
                  ))}
                </View>
              )}
              {profile.interests?.length > 0 && (
                <View {...{ "data-testid": "modern-cv-interests" }}>
                  <Text style={styles.cvSideHeading}>Persönliche Interessen</Text>
                  {profile.interests.map((interest, i) => (
                    <SkillBar key={i} label={interest} />
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
