import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9,
    color: "#64748b",
    columnGap: 12,
    rowGap: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 2,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#334155",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  skillText: {
    fontSize: 8.5,
    color: "#334155",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  jobEntry: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitleCompany: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  jobDates: {
    fontSize: 8.5,
    color: "#64748b",
  },
  bulletPoint: {
    fontSize: 8.5,
    color: "#334155",
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  eduEntry: {
    marginBottom: 4,
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
  degree: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  institution: {
    color: "#475569",
  },
  eduYear: {
    color: "#64748b",
  },
});

type PolishedExperience = {
  company_name: string;
  job_title: string;
  duration: string;
  bulletPoints: string[];
};

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experience: PolishedExperience[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
};

export function ResumePDF({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <View style={styles.contactRow}>
            {data.email && <Text>Email: {data.email}</Text>}
            {data.phone && <Text>Phone: {data.phone}</Text>}
            {data.location && <Text>Location: {data.location}</Text>}
            {data.linkedin && <Text>LinkedIn: {data.linkedin}</Text>}
            {data.portfolio && <Text>Portfolio: {data.portfolio}</Text>}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={styles.skillText}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work History</Text>
            {data.experience.map((job, idx) => (
              <View key={idx} style={styles.jobEntry}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitleCompany}>
                    {job.job_title} at {job.company_name}
                  </Text>
                  <Text style={styles.jobDates}>{job.duration}</Text>
                </View>
                {job.bulletPoints && job.bulletPoints.map((bullet, bIdx) => (
                  <Text key={bIdx} style={styles.bulletPoint}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, idx) => (
              <View key={idx} style={styles.eduEntry}>
                <View style={styles.eduHeader}>
                  <Text style={styles.degree}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={styles.institution}>{edu.institution}</Text>
                  <Text style={styles.eduYear}>{edu.year}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
