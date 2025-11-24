import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

// Register standard fonts if needed, but Helvetica is built-in.
// We rely on Helvetica for a clean, neutral look that fits the "Swiss Style" of the portfolio.

const ACCENT_COLOR = '#D5FF0A'; // Neon Lime
const TEXT_COLOR = '#08080d';   // Almost Black
const SUBTEXT_COLOR = '#555555';

const styles = StyleSheet.create({
  page: {
    padding: '40 50', // Generous margins
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_COLOR,
    lineHeight: 1.5,
  },
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    borderBottom: `1 solid ${TEXT_COLOR}`,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 5,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 3, // Heavy tracking like the site
    marginBottom: 6,
  },
  role: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: SUBTEXT_COLOR,
    backgroundColor: ACCENT_COLOR,
    padding: '2 6',
    alignSelf: 'flex-start', // Wrap text only
  },
  contactItem: {
    fontSize: 9,
    letterSpacing: 0.5,
    color: SUBTEXT_COLOR,
    marginBottom: 2,
    textDecoration: 'none',
  },
  
  // SECTIONS
  section: {
    marginBottom: 25,
    break: false,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    borderBottom: `2 solid ${ACCENT_COLOR}`,
    paddingBottom: 2,
  },

  // ITEMS
  item: {
    marginBottom: 12,
    paddingLeft: 0,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  itemMain: {
    width: '80%',
  },
  itemSidebar: {
    width: '20%',
    alignItems: 'flex-end',
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  itemSubtitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: '#444',
    marginTop: 1,
  },
  itemDate: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 9.5,
    color: '#333',
    marginTop: 4,
    textAlign: 'justify',
    lineHeight: 1.4,
  },
  location: {
    fontSize: 8,
    color: '#888',
    marginTop: 1,
  }
});

// Types
type CVData = {
  sections: CVSection[];
}

type CVSection = {
  id?: string;
  type: string;
  translations: { locale: string; title?: string }[];
  items: CVItem[];
}

type CVItem = {
  id?: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  translations: {
    locale: string;
    title?: string;
    subtitle?: string | null;
    location?: string | null;
    description?: string | null;
  }[];
}

const formatDate = (dateStr: string | null | undefined, locale: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  // Keep it short: "Jan 2024" or "2024" depending on preference. 
  // Let's use Month Year for detail.
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'short' });
};

type BaseTranslation = { locale: string };

export const CVDocument = ({ data, locale }: { data: CVData, locale: string }) => {
  const t = <T extends BaseTranslation>(arr: T[]): T | undefined => 
    arr?.find((x) => x.locale === locale) ?? arr?.[0];
    
  const isFr = locale === 'fr';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>Caroline Senyk</Text>
            <Text style={styles.role}>
              {isFr ? "Superviseure Musicale & Productrice" : "Music Supervisor & Producer"}
            </Text>
          </View>
          <View style={styles.headerRight}>
             <Link src="mailto:caroline.senyk@synck.com" style={styles.contactItem}>caroline.senyk@synck.com</Link>
             <Link src="https://synck.com" style={styles.contactItem}>www.synck.com</Link>
             <Text style={styles.contactItem}>Paris, France</Text>
          </View>
        </View>

        {/* Sections */}
        {data.sections?.map((section, index) => {
           const sectionTitle = t(section.translations)?.title ?? section.type;
           
           return (
             <View key={index} style={styles.section}>
               <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>{sectionTitle}</Text>
               </View>

               {section.items?.map((item, i) => {
                 const itemT = t(item.translations);
                 const start = formatDate(item.startDate, locale);
                 const end = item.isCurrent 
                    ? (isFr ? "Présent" : "Present") 
                    : formatDate(item.endDate, locale);
                 
                 let dateStr = "";
                 if (start && end) dateStr = `${start} – ${end}`;
                 else if (start) dateStr = start;
                 else if (end) dateStr = end;

                 return (
                   <View key={i} style={styles.item}>
                     <View style={styles.itemRow}>
                       <View style={styles.itemMain}>
                         <Text style={styles.itemTitle}>{itemT?.title}</Text>
                         {itemT?.subtitle && (
                            <Text style={styles.itemSubtitle}>{itemT.subtitle}</Text>
                         )}
                       </View>
                       <View style={styles.itemSidebar}>
                         <Text style={styles.itemDate}>{dateStr}</Text>
                         {itemT?.location && (
                            <Text style={styles.location}>{itemT.location}</Text>
                         )}
                       </View>
                     </View>
                     {itemT?.description && (
                        <Text style={styles.itemDescription}>{itemT.description}</Text>
                     )}
                   </View>
                 );
               })}
             </View>
           );
        })}
      </Page>
    </Document>
  );
};