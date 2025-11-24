import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  Svg,
  Polygon,
} from "@react-pdf/renderer";

// ===== Types =====
type CVTheme = {
  primary: string;
  secondary: string;
  header: string;
  sidebar: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  badge: string;
};

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
  placement?: string;
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
  theme?: Partial<CVTheme> | null;
  sections: CVSection[];
  skills: CVSkill[];
  socialLinks: CVSocialLink[];
};

// ===== Helpers =====
const defaultTheme: CVTheme = {
  primary: "#D5FF0A",
  secondary: "#9EF01A",
  header: "#0B0C12",
  sidebar: "#F4F5F7",
  surface: "#FFFFFF",
  text: "#0D0E11",
  muted: "#60626A",
  border: "#E2E4EA",
  badge: "#0F1118",
};

const createStyles = (theme: CVTheme) =>
  StyleSheet.create({
    page: {
      padding: 0,
      backgroundColor: theme.surface,
      fontFamily: "Helvetica",
      color: theme.text,
    },
    header: {
      position: "relative",
      backgroundColor: theme.header,
      height: 190,
      padding: "28 36 34 36",
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    headerShapes: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    headerContent: {
      zIndex: 2,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    headerLeft: {
      flex: 1,
    },
    name: {
      fontSize: 26,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 3,
      color: "#FFFFFF",
      textTransform: "uppercase",
    },
    headline: {
      fontSize: 12,
      color: theme.primary,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginTop: 6,
    },
    headerSeparator: {
      marginTop: 10,
      marginBottom: 12,
      height: 2,
      width: 90,
      backgroundColor: theme.primary,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    contactItem: {
      fontSize: 8.5,
      color: "#E7E7EC",
      marginRight: 12,
      marginTop: 6,
      textDecoration: "none",
    },
    badge: {
      backgroundColor: theme.badge,
      color: "#FFFFFF",
      fontSize: 9,
      padding: "6 10",
      borderRadius: 12,
      letterSpacing: 2,
      textTransform: "uppercase",
      alignSelf: "flex-start",
    },
    photoBadge: {
      position: "absolute",
      bottom: -45,
      left: 38,
      width: 110,
      height: 110,
      borderRadius: 55,
      border: `4 solid ${theme.primary}`,
      backgroundColor: "#0E0E14",
      overflow: "hidden",
      zIndex: 3,
    },
    photo: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    body: {
      flexDirection: "row",
    },
    sidebar: {
      width: "33%",
      backgroundColor: theme.sidebar,
      padding: "36 26 30 34",
      borderRight: `2 solid ${theme.primary}`,
      minHeight: 652,
    },
    sidebarBlock: {
      marginBottom: 18,
    },
    sidebarTitle: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 1.6,
      color: theme.text,
      textTransform: "uppercase",
    },
    sidebarTitleBar: {
      width: 32,
      height: 2,
      backgroundColor: theme.primary,
      marginBottom: 8,
      marginTop: 6,
    },
    paragraph: {
      fontSize: 8.5,
      lineHeight: 1.45,
      color: theme.muted,
      textAlign: "justify",
    },
    contactLine: {
      fontSize: 8.5,
      color: theme.text,
      marginBottom: 6,
    },
    skillItem: {
      marginBottom: 9,
    },
    skillLabel: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: theme.text,
      marginBottom: 3,
    },
    skillBar: {
      width: "100%",
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    skillBarFill: {
      height: 6,
      borderRadius: 4,
      backgroundColor: theme.primary,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 4,
    },
    softBadge: {
      backgroundColor: "#FFFFFF",
      border: `1 solid ${theme.primary}`,
      color: theme.text,
      padding: "4 8",
      fontSize: 8,
      borderRadius: 10,
      marginRight: 6,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    listItem: {
      marginBottom: 8,
    },
    listTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: theme.text,
    },
    listSubtitle: {
      fontSize: 8,
      fontFamily: "Helvetica-Oblique",
      color: theme.muted,
    },
    main: {
      width: "67%",
      padding: "36 32 34 30",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    sectionSquare: {
      width: 13,
      height: 13,
      backgroundColor: theme.primary,
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      letterSpacing: 2.2,
      textTransform: "uppercase",
      color: theme.text,
    },
    timelineItem: {
      flexDirection: "row",
      marginBottom: 18,
      position: "relative",
    },
    timelineRail: {
      width: 16,
      alignItems: "center",
      position: "relative",
    },
    timelineLine: {
      position: "absolute",
      top: 12,
      bottom: -18,
      width: 1.5,
      backgroundColor: theme.border,
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
      border: `2 solid ${theme.surface}`,
      marginTop: 2,
      zIndex: 2,
    },
    timelineYear: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: theme.muted,
      marginBottom: 2,
      textAlign: "right",
    },
    timelineContent: {
      flex: 1,
      paddingLeft: 10,
    },
    expTitle: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: theme.text,
      textTransform: "uppercase",
    },
    expSubtitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Oblique",
      color: theme.muted,
      marginBottom: 2,
    },
    expMeta: {
      fontSize: 8,
      color: theme.muted,
      marginBottom: 5,
    },
    expDesc: {
      fontSize: 8.2,
      color: "#2F3035",
      lineHeight: 1.4,
      textAlign: "justify",
    },
    card: {
      padding: 10,
      borderRadius: 8,
      border: `1 solid ${theme.border}`,
      marginBottom: 12,
      backgroundColor: "#FFFFFF",
    },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    pill: {
      border: `1 solid ${theme.border}`,
      borderRadius: 10,
      padding: "3 7",
      fontSize: 8,
      color: theme.text,
      marginRight: 6,
      marginBottom: 6,
    },
  });

const HeaderShapes = ({ theme }: { theme: CVTheme }) => (
  <Svg style={styles.headerShapes} viewBox="0 0 600 190">
    <Polygon points="0,0 180,0 0,190" fill="#11131C" opacity={0.8} />
    <Polygon points="420,0 620,0 620,190" fill="#11131C" opacity={0.8} />
    <Polygon points="520,0 620,0 620,110" fill={theme.primary} opacity={0.8} />
    <Polygon points="0,140 60,190 0,190" fill={theme.primary} opacity={0.8} />
    <Polygon points="140,0 340,0 240,120" fill={theme.secondary} opacity={0.14} />
  </Svg>
);

const styles = createStyles(defaultTheme);

export const CVDocument = ({ data, locale }: { data: CVData; locale: string }) => {
  const mergedTheme: CVTheme = {
    ...defaultTheme,
    ...(data.theme || {}),
  } as CVTheme;

  // Keep backward compatibility with accentColor
  if (data.accentColor) {
    mergedTheme.primary = data.accentColor;
  }

  const isFr = locale === "fr";
  const headline = isFr ? data.headlineFr : data.headlineEn;
  const bio = isFr ? data.bioFr : data.bioEn;

  const t = (arr: CVTranslation[]) => arr.find((x) => x.locale === locale) || arr[0] || {};

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(isFr ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const formatRange = (item: CVItem) => {
    const start = formatDate(item.startDate);
    const end = item.isCurrent ? (isFr ? "Présent" : "Present") : formatDate(item.endDate);
    if (start && end) return `${start} — ${end}`;
    return start || end || "";
  };

  const activeSections = (data.sections || [])
    .filter((s) => s.isActive !== false)
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      items: (section.items || [])
        .filter((i) => i.isActive !== false)
        .sort((a, b) => a.order - b.order),
    }));

  const experienceSection = activeSections.find(
    (s) => s.type === "experience" && s.placement !== "sidebar",
  );
  const mainSections = activeSections.filter(
    (s) => s.type !== "experience" && s.placement !== "sidebar",
  );
  const sidebarSections = activeSections.filter((s) => s.placement === "sidebar");
  const educationSection = sidebarSections.find((s) => s.type === "education");
  const customSidebarSections = sidebarSections.filter((s) => s.type !== "education");

  const technicalSkills = (data.skills || [])
    .filter((s) => s.category === "technical" && s.isActive !== false)
    .sort((a, b) => a.order - b.order);
  const softwareSkills = (data.skills || [])
    .filter((s) => s.category === "software" && s.isActive !== false)
    .sort((a, b) => a.order - b.order);
  const languages = (data.skills || [])
    .filter((s) => s.category === "language" && s.isActive !== false)
    .sort((a, b) => a.order - b.order);

  const socialFromLinks = (data.socialLinks || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((link) => ({
      label: link.label || link.platform,
      value: link.url,
      isLink: true,
    }));

  const contactItems = [
    data.email ? { label: "Email", value: data.email, isLink: true, href: `mailto:${data.email}` } : null,
    data.phone ? { label: isFr ? "Téléphone" : "Phone", value: data.phone } : null,
    data.linkedInUrl
      ? { label: "LinkedIn", value: data.linkedInUrl, isLink: true, href: data.linkedInUrl }
      : null,
    data.website
      ? {
          label: isFr ? "Site" : "Website",
          value: data.website.replace(/^https?:\/\//, ""),
          isLink: true,
          href: data.website,
        }
      : null,
    data.location ? { label: isFr ? "Localisation" : "Location", value: data.location } : null,
    ...socialFromLinks,
  ].filter((x) => x && x.value) as { label?: string; value: string; isLink?: boolean; href?: string }[];

  // Remove duplicates by value
  const seenContacts = new Set<string>();
  const dedupedContacts = contactItems.filter((item) => {
    if (seenContacts.has(item.value)) return false;
    seenContacts.add(item.value);
    return true;
  });

  const stylesWithTheme = createStyles(mergedTheme);

  const renderSidebarSection = (section: CVSection) => {
    const sectionColor = section.color || mergedTheme.primary;
    const sectionTitle = t(section.translations)?.title;
    return (
      <View key={section.id || sectionTitle} style={stylesWithTheme.sidebarBlock}>
        {sectionTitle && (
          <View>
            <Text style={stylesWithTheme.sidebarTitle}>{sectionTitle}</Text>
            <View style={[stylesWithTheme.sidebarTitleBar, { backgroundColor: sectionColor }]} />
          </View>
        )}
        {section.items.map((item) => {
          const it = t(item.translations);
          return (
            <View key={item.id || it?.title} style={stylesWithTheme.listItem}>
              {it?.title && <Text style={stylesWithTheme.listTitle}>{it.title}</Text>}
              {it?.subtitle && <Text style={stylesWithTheme.listSubtitle}>{it.subtitle}</Text>}
              {it?.location && <Text style={stylesWithTheme.listSubtitle}>{it.location}</Text>}
              {item.startDate && (
                <Text style={stylesWithTheme.listSubtitle}>
                  {formatDate(item.startDate)}
                  {item.endDate || item.isCurrent ? ` — ${item.isCurrent ? (isFr ? "Présent" : "Present") : formatDate(item.endDate)}` : ""}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderMainSection = (section: CVSection) => {
    const sectionColor = section.color || mergedTheme.primary;
    const title = t(section.translations)?.title;
    return (
      <View key={section.id || title} style={{ marginBottom: 20 }}>
        {title && (
          <View style={stylesWithTheme.sectionHeader}>
            <View style={[stylesWithTheme.sectionSquare, { backgroundColor: sectionColor }]} />
            <Text style={stylesWithTheme.sectionTitle}>{title}</Text>
          </View>
        )}
        {(section.layoutType === "timeline" || section.type === "timeline") &&
          section.items.map((item, idx) => {
            const it = t(item.translations);
            const isLast = idx === section.items.length - 1;
            return (
              <View key={item.id || it?.title} style={stylesWithTheme.timelineItem}>
                <View style={{ width: 52, paddingTop: 2 }}>
                  <Text style={stylesWithTheme.timelineYear}>{formatDate(item.startDate)}</Text>
                  <Text style={stylesWithTheme.timelineYear}>
                    {item.isCurrent ? (isFr ? "Présent" : "Present") : formatDate(item.endDate)}
                  </Text>
                </View>
                <View style={stylesWithTheme.timelineRail}>
                  <View style={[stylesWithTheme.timelineDot, { backgroundColor: sectionColor }]} />
                  {!isLast && <View style={stylesWithTheme.timelineLine} />}
                </View>
                <View style={stylesWithTheme.timelineContent}>
                  {it?.title && <Text style={stylesWithTheme.expTitle}>{it.title}</Text>}
                  {it?.subtitle && <Text style={stylesWithTheme.expSubtitle}>{it.subtitle}</Text>}
                  <Text style={stylesWithTheme.expMeta}>
                    {formatRange(item)}
                    {it?.location ? ` • ${it.location}` : ""}
                  </Text>
                  {it?.description && <Text style={stylesWithTheme.expDesc}>{it.description}</Text>}
                </View>
              </View>
            );
          })}

        {(section.layoutType === "list" || !section.layoutType) &&
          section.items.map((item) => {
            const it = t(item.translations);
            return (
              <View key={item.id || it?.title} style={stylesWithTheme.card}>
                {it?.title && <Text style={stylesWithTheme.expTitle}>{it.title}</Text>}
                {it?.subtitle && <Text style={stylesWithTheme.expSubtitle}>{it.subtitle}</Text>}
                {(it?.location || item.startDate) && (
                  <Text style={stylesWithTheme.expMeta}>
                    {formatRange(item)}
                    {it?.location ? ` • ${it.location}` : ""}
                  </Text>
                )}
                {it?.description && <Text style={stylesWithTheme.expDesc}>{it.description}</Text>}
              </View>
            );
          })}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={stylesWithTheme.page} wrap>
        <View style={[stylesWithTheme.header, { backgroundColor: mergedTheme.header }]}> 
          <HeaderShapes theme={mergedTheme} />
          <View style={stylesWithTheme.headerContent}>
            <View style={stylesWithTheme.headerLeft}>
              <Text style={stylesWithTheme.name}>Caroline Senyk</Text>
              {headline && <Text style={stylesWithTheme.headline}>{headline}</Text>}
              <View style={stylesWithTheme.headerSeparator} />
              <View style={stylesWithTheme.contactRow}>
                {dedupedContacts.slice(0, 4).map((item) => {
                  if (item.isLink && item.href) {
                    return (
                      <Link key={item.value} src={item.href} style={stylesWithTheme.contactItem}>
                        {item.value.replace(/^mailto:/, "").replace(/^tel:/, "")}
                      </Link>
                    );
                  }
                  if (item.value.startsWith("http")) {
                    return (
                      <Link key={item.value} src={item.value} style={stylesWithTheme.contactItem}>
                        {item.value.replace(/^https?:\/\//, "")}
                      </Link>
                    );
                  }
                  return (
                    <Text key={item.value} style={stylesWithTheme.contactItem}>
                      {item.value}
                    </Text>
                  );
                })}
              </View>
            </View>
            <View>
              <Text style={stylesWithTheme.badge}>{isFr ? "Gestionnaire de droits" : "Rights manager"}</Text>
            </View>
          </View>
          {data.showPhoto && data.photo && (
            <View style={stylesWithTheme.photoBadge}>
              <Image src={data.photo} style={stylesWithTheme.photo} />
            </View>
          )}
        </View>

        <View style={stylesWithTheme.body}>
          {/* Sidebar */}
          <View style={stylesWithTheme.sidebar}>
            {/* Contact block */}
            {dedupedContacts.length > 0 && (
              <View style={stylesWithTheme.sidebarBlock}>
                <Text style={stylesWithTheme.sidebarTitle}>{isFr ? "Coordonnées" : "Contact"}</Text>
                <View style={stylesWithTheme.sidebarTitleBar} />
                {dedupedContacts.map((item) => (
                  <Text key={item.value} style={stylesWithTheme.contactLine}>
                    {item.label ? `${item.label}: ` : ""}
                    {item.value.replace(/^mailto:/, "").replace(/^tel:/, "")}
                  </Text>
                ))}
              </View>
            )}

            {/* Bio */}
            {bio && (
              <View style={stylesWithTheme.sidebarBlock}>
                <Text style={stylesWithTheme.sidebarTitle}>{isFr ? "Profil" : "Profile"}</Text>
                <View style={stylesWithTheme.sidebarTitleBar} />
                <Text style={stylesWithTheme.paragraph}>{bio}</Text>
              </View>
            )}

            {/* Skills */}
            {technicalSkills.length > 0 && (
              <View style={stylesWithTheme.sidebarBlock}>
                <Text style={stylesWithTheme.sidebarTitle}>{isFr ? "Compétences" : "Skills"}</Text>
                <View style={stylesWithTheme.sidebarTitleBar} />
                {technicalSkills.map((skill) => {
                  const st = t(skill.translations);
                  const percent = `${(skill.level / 5) * 100}%`;
                  return (
                    <View key={skill.id || st?.name} style={stylesWithTheme.skillItem}>
                      <Text style={stylesWithTheme.skillLabel}>{st?.name}</Text>
                      {skill.showAsBar && (
                        <View style={stylesWithTheme.skillBar}>
                          <View style={[stylesWithTheme.skillBarFill, { width: percent }]} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Software */}
            {softwareSkills.length > 0 && (
              <View style={stylesWithTheme.sidebarBlock}>
                <Text style={stylesWithTheme.sidebarTitle}>{isFr ? "Logiciels" : "Tools"}</Text>
                <View style={stylesWithTheme.sidebarTitleBar} />
                <View style={stylesWithTheme.badgeRow}>
                  {softwareSkills.map((skill) => {
                    const st = t(skill.translations);
                    return (
                      <Text key={skill.id || st?.name} style={stylesWithTheme.softBadge}>
                        {st?.name}
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <View style={stylesWithTheme.sidebarBlock}>
                <Text style={stylesWithTheme.sidebarTitle}>{isFr ? "Langues" : "Languages"}</Text>
                <View style={stylesWithTheme.sidebarTitleBar} />
                <View style={stylesWithTheme.badgeRow}>
                  {languages.map((lang) => {
                    const st = t(lang.translations);
                    return (
                      <Text key={lang.id || st?.name} style={stylesWithTheme.softBadge}>
                        {st?.name}
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Education */}
            {educationSection && educationSection.items.length > 0 && renderSidebarSection(educationSection)}

            {/* Other sidebar sections */}
            {customSidebarSections
              .filter((s) => s.id !== educationSection?.id)
              .map((section) => renderSidebarSection(section))}
          </View>

          {/* Main content */}
          <View style={stylesWithTheme.main}>
            {experienceSection && experienceSection.items.length > 0 && (
              <View style={{ marginBottom: 18 }}>
                <View style={stylesWithTheme.sectionHeader}>
                  <View
                    style={[stylesWithTheme.sectionSquare, { backgroundColor: experienceSection.color || mergedTheme.primary }]}
                  />
                  <Text style={stylesWithTheme.sectionTitle}>
                    {t(experienceSection.translations)?.title || (isFr ? "Expériences" : "Experience")}
                  </Text>
                </View>
                {experienceSection.items.map((item, idx) => {
                  const it = t(item.translations);
                  const isLast = idx === experienceSection.items.length - 1;
                  return (
                    <View key={item.id || it?.title} style={stylesWithTheme.timelineItem}>
                      <View style={{ width: 52, paddingTop: 2 }}>
                        <Text style={stylesWithTheme.timelineYear}>{formatDate(item.startDate)}</Text>
                        <Text style={stylesWithTheme.timelineYear}>
                          {item.isCurrent ? (isFr ? "Présent" : "Present") : formatDate(item.endDate)}
                        </Text>
                      </View>
                      <View style={stylesWithTheme.timelineRail}>
                        <View
                          style={[stylesWithTheme.timelineDot, { backgroundColor: experienceSection.color || mergedTheme.primary }]}
                        />
                        {!isLast && <View style={stylesWithTheme.timelineLine} />}
                      </View>
                      <View style={stylesWithTheme.timelineContent}>
                        {it?.title && <Text style={stylesWithTheme.expTitle}>{it.title}</Text>}
                        {it?.subtitle && <Text style={stylesWithTheme.expSubtitle}>{it.subtitle}</Text>}
                        <Text style={stylesWithTheme.expMeta}>
                          {formatRange(item)}
                          {it?.location ? ` • ${it.location}` : ""}
                        </Text>
                        {it?.description && <Text style={stylesWithTheme.expDesc}>{it.description}</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {mainSections.map((section) => renderMainSection(section))}
          </View>
        </View>
      </Page>
    </Document>
  );
};
