import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ProfileData } from "@/lib/profile-storage";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 16,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  address: {
    fontSize: 10,
    color: "#6b7280",
  },
  body: {
    whiteSpace: "pre-wrap",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 6,
    color: "#374151",
  },
});

interface CoverLetterDocumentProps {
  coverLetter: string;
  profile: ProfileData;
}

export function CoverLetterDocument({ coverLetter, profile }: CoverLetterDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.address}>{profile.address}</Text> : null}
        </View>
        <View style={styles.body}>
          <Text>{coverLetter}</Text>
        </View>
      </Page>
    </Document>
  );
}

interface CvDocumentProps {
  cv: string;
  profile: ProfileData;
}

export function CvDocument({ cv, profile }: CvDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.address ? <Text style={styles.address}>{profile.address}</Text> : null}
        </View>
        <View style={styles.body}>
          <Text>{cv}</Text>
        </View>
      </Page>
    </Document>
  );
}
