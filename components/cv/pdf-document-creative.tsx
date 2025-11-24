import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

// Colors from portfolio design system
const NEON_LIME = "#D5FF0A";
const BLACK = "#08080d";
const DARK_GRAY = "#555555";
const LIGHT_GRAY = "#999999";
const ULTRA_LIGHT_GRAY = "#F8F8F8";
const WHITE = "#FFFFFF";
const BORDER_GRAY = "#E0E0E0";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: WHITE,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BLACK,
  },

  // HEADER with photo
  header: {
    backgroundColor: BLACK,
    padding: "30 40",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    border: `3 solid ${NEON_LIME}`,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headline: {
    fontSize: 12,
    color: NEON_LIME,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    gap: 15,
    marginTop: 8,
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 8,
    color: LIGHT_GRAY,
    textDecoration: "none",
  },

  // LAYOUT: Sidebar + Main
  body: {
    flexDirection: "row",
    flex: 1,
  },

  // SIDEBAR (35%)
  sidebar: {
    width: "35%",
    backgroundColor: ULTRA_LIGHT_GRAY,
    padding: "25 20",
    borderRight: `2 solid ${NEON_LIME}`,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottom: `2 solid ${NEON_LIME}`,
  },

  // Bio text
  bioText: {
    fontSize: 8,
    lineHeight: 1.4,
    textAlign: "justify",
    color: DARK_GRAY,
  },

  // Skills with progress bars
  skillItem: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  skillBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: BORDER_GRAY,
    borderRadius: 3,
  },
  skillBarFill: {
    height: "100%",
    backgroundColor: NEON_LIME,
    borderRadius: 3,
  },

  // Badges (software/languages)
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  badge: {
    backgroundColor: NEON_LIME,
    color: BLACK,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    padding: "3 8",
    borderRadius: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // List items (education, interests)
  listItem: {
    marginBottom: 6,
    fontSize: 9,
  },
  listItemTitle: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 8,
    color: DARK_GRAY,
  },

  // MAIN CONTENT (65%)
  main: {
    width: "65%",
    padding: "25 30",
  },
  mainSectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottom: `3 solid ${NEON_LIME}`,
  },

  // Timeline experience
  timelineItem: {
    flexDirection: "row",
    marginBottom: 15,
    position: "relative",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NEON_LIME,
    marginRight: 12,
    marginTop: 3,
    flexShrink: 0,
  },
  timelineContent: {
    flex: 1,
  },
  expTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BLACK,
    marginBottom: 2,
  },
  expSubtitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: DARK_GRAY,
    marginBottom: 2,
  },
  expDate: {
    fontSize: 8,
    color: LIGHT_GRAY,
    marginBottom: 5,
  },
  expDescription: {
    fontSize: 8,
    color: "#444",
    lineHeight: 1.4,
    textAlign: "justify",
  },
});

// Types
type CVTranslation = {
  locale: string;
  title?: string;
  subtitle?: string | null;
  location?: string | null;
  description?: string | null;
  name?: string;
};

type CVItem = {
  id?: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  order: number;
  isActive?: boolean;
  translations: CVTranslation[];
};

type CVSection = {
  id?: string;
  type: string;
  icon?: string | null;
  color?: string | null;
  layoutType?: string;
  order: number;
  isActive?: boolean;
  translations: CVTranslation[];
  items: CVItem[];
};

type CVSkill = {
  id?: string;
  category: string;
  level: number;
  showAsBar?: boolean;
  order: number;
  isActive?: boolean;
  translations: CVTranslation[];
};

type CVSocialLink = {
  platform: string;
  url: string;
  label?: string | null;
  order: number;
};

type CVData = {
  id?: string;
  photo?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  location?: string | null;
  linkedInUrl?: string | null;
  headlineFr?: string | null;
  headlineEn?: string | null;
  bioFr?: string | null;
  bioEn?: string | null;
  layout?: string;
  accentColor?: string;
  showPhoto?: boolean;
  sections: CVSection[];
  skills: CVSkill[];
  socialLinks: CVSocialLink[];
};

export const CVDocumentCreative = ({
  data,
  locale,
}: {
  data: CVData;
  locale: string;
}) => {
  const isFr = locale === "fr";
  const headline = isFr ? data.headlineFr : data.headlineEn;
  const bio = isFr ? data.bioFr : data.bioEn;

  // Séparer skills par catégorie
  const technicalSkills = data.skills
    .filter((s) => s.category === "technical")
    .sort((a, b) => a.order - b.order);
  const softwareSkills = data.skills
    .filter((s) => s.category === "software")
    .sort((a, b) => a.order - b.order);
  const languages = data.skills
    .filter((s) => s.category === "language")
    .sort((a, b) => a.order - b.order);

  // Séparer sections
  const experienceSection = data.sections.find((s) => s.type === "experience");
  const educationSection = data.sections.find((s) => s.type === "education");
  const interestsSection = data.sections.find(
    (s) => s.type === "custom" && s.order === 2,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          {data.showPhoto && data.photo && (
            <View style={styles.photoContainer}>
              <Image src={data.photo} style={styles.photo} />
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.name}>CAROLINE SENYK</Text>
            {headline && <Text style={styles.headline}>{headline}</Text>}
            <View style={styles.contactRow}>
              {data.phone && (
                <Text style={styles.contactItem}>{data.phone}</Text>
              )}
              {data.email && (
                <Link src={`mailto:${data.email}`} style={styles.contactItem}>
                  {data.email}
                </Link>
              )}
              {data.location && (
                <Text style={styles.contactItem}>{data.location}</Text>
              )}
            </View>
          </View>
        </View>

        {/* BODY: Sidebar + Main */}
        <View style={styles.body}>
          {/* SIDEBAR */}
          <View style={styles.sidebar}>
            {/* PROFIL */}
            {bio && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>
                  {isFr ? "PROFIL" : "PROFILE"}
                </Text>
                <Text style={styles.bioText}>{bio}</Text>
              </View>
            )}

            {/* COMPÉTENCES */}
            {technicalSkills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>
                  {isFr ? "COMPÉTENCES" : "SKILLS"}
                </Text>
                {technicalSkills.map((skill) => {
                  const trans = skill.translations.find(
                    (t) => t.locale === locale,
                  );
                  const percent = String((skill.level / 5) * 100);
                  return (
                    <View key={skill.id} style={styles.skillItem}>
                      <Text style={styles.skillName}>{trans?.name}</Text>
                      {skill.showAsBar && (
                        <View style={styles.skillBarBg}>
                          <View
                            style={[
                              styles.skillBarFill,
                              { width: `${percent}%` },
                            ]}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* LOGICIELS */}
            {softwareSkills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>
                  {isFr ? "LOGICIELS" : "SOFTWARE"}
                </Text>
                <View style={styles.badgesRow}>
                  {softwareSkills.map((skill) => {
                    const trans = skill.translations.find(
                      (t) => t.locale === locale,
                    );
                    return (
                      <Text key={skill.id} style={styles.badge}>
                        {trans?.name}
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}

            {/* LANGUES */}
            {languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>
                  {isFr ? "LANGUES" : "LANGUAGES"}
                </Text>
                <View style={styles.badgesRow}>
                  {languages.map((lang) => {
                    const trans = lang.translations.find(
                      (t) => t.locale === locale,
                    );
                    return (
                      <Text key={lang.id} style={styles.badge}>
                        {trans?.name}
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}

            {/* FORMATION */}
            {educationSection && educationSection.items.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>
                  {
                    educationSection.translations.find(
                      (t) => t.locale === locale,
                    )?.title
                  }
                </Text>
                {educationSection.items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const itemTrans = item.translations.find(
                      (t) => t.locale === locale,
                    );
                    return (
                      <View key={item.id} style={styles.listItem}>
                        <Text style={styles.listItemTitle}>
                          {itemTrans?.title}
                        </Text>
                        {itemTrans?.subtitle && (
                          <Text style={styles.listItemSubtitle}>
                            {itemTrans.subtitle}
                          </Text>
                        )}
                        {itemTrans?.location && (
                          <Text style={styles.listItemSubtitle}>
                            {itemTrans.location}
                          </Text>
                        )}
                      </View>
                    );
                  })}
              </View>
            )}

            {/* INTÉRÊTS */}
            {interestsSection && interestsSection.items.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>
                  {
                    interestsSection.translations.find(
                      (t) => t.locale === locale,
                    )?.title
                  }
                </Text>
                {interestsSection.items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const itemTrans = item.translations.find(
                      (t) => t.locale === locale,
                    );
                    return (
                      <View key={item.id} style={styles.listItem}>
                        <Text style={styles.listItemTitle}>
                          • {itemTrans?.title}
                        </Text>
                        {itemTrans?.subtitle && (
                          <Text style={styles.listItemSubtitle}>
                            {itemTrans.subtitle}
                            {itemTrans.description &&
                              ` (${itemTrans.description})`}
                          </Text>
                        )}
                      </View>
                    );
                  })}
              </View>
            )}
          </View>

          {/* MAIN CONTENT */}
          <View style={styles.main}>
            {/* EXPÉRIENCES */}
            {experienceSection && experienceSection.items.length > 0 && (
              <View>
                <Text style={styles.mainSectionTitle}>
                  {
                    experienceSection.translations.find(
                      (t) => t.locale === locale,
                    )?.title
                  }
                </Text>
                {experienceSection.items
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const itemTrans = item.translations.find(
                      (t) => t.locale === locale,
                    );
                    const startDate = item.startDate
                      ? new Date(item.startDate).toLocaleDateString(
                          isFr ? "fr-FR" : "en-US",
                          { year: "numeric", month: "short" },
                        )
                      : "";
                    const endDate = item.isCurrent
                      ? isFr
                        ? "Présent"
                        : "Present"
                      : item.endDate
                        ? new Date(item.endDate).toLocaleDateString(
                            isFr ? "fr-FR" : "en-US",
                            { year: "numeric", month: "short" },
                          )
                        : "";
                    const dateRange =
                      startDate && endDate ? `${startDate} - ${endDate}` : "";

                    return (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.expTitle}>
                            {itemTrans?.title}
                          </Text>
                          {itemTrans?.subtitle && (
                            <Text style={styles.expSubtitle}>
                              {itemTrans.subtitle}
                            </Text>
                          )}
                          <Text style={styles.expDate}>
                            {dateRange}
                            {itemTrans?.location && ` • ${itemTrans.location}`}
                          </Text>
                          {itemTrans?.description && (
                            <Text style={styles.expDescription}>
                              {itemTrans.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
