"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { Breadcrumb } from "@/components/breadcrumb";
import { ContactForm } from "@/components/contact-form";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeader } from "@/components/layout/page-header";
import { smoothTransition } from "@/lib/animations";
import type { Locale } from "@/lib/i18n-config";
import type { ContactFormDictionary } from "@/types/dictionary";

type Service = {
  title: string;
  description: string;
};

type ContactPageClientProps = {
  locale: Locale;
  nav: {
    home: string;
    contact: string;
  };
  copy: {
    heroDescription: string;
    introTitle: string;
    introDescription: string;
    contactInfoTitle: string;
    emailLabel: string;
    emailValue: string;
    locationLabel: string;
    locationValue: string;
    linkedinLabel: string;
    linkedinUrl: string;
    linkedinCta: string;
    availabilityLabel: string;
    availabilityValue: string;
    servicesTitle: string;
    services: Service[];
    consultationTitle: string;
    consultationDescription: string;
  };
  formDictionary: ContactFormDictionary;
};

/** Animated info card */
function InfoCard({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-glow-neon-sm)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Animated contact info item */
function ContactInfoItem({
  label,
  children,
  index,
}: {
  label: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.1, ...smoothTransition }}
      className="mb-6 pb-6 border-b border-[var(--color-border)]"
    >
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">
        {label}
      </h4>
      {children}
    </motion.div>
  );
}

export function ContactPageClient({
  locale,
  nav,
  copy,
  formDictionary,
}: ContactPageClientProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const isFormInView = useInView(formRef, { once: true, margin: "-50px" });

  return (
    <PageLayout
      orbsConfig="default"
      glowTracking
      glowConfig="contact"
      glowFullscreen
      className="mx-auto max-w-[1600px]"
    >
      <Breadcrumb
        items={[
          { label: nav.home, href: `/${locale}` },
          { label: nav.contact },
        ]}
      />

      <PageHeader
        title={nav.contact}
        description={copy.heroDescription}
        highlightFirstLetter
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left - Form */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isFormInView ? { opacity: 1, y: 0 } : {}}
          transition={smoothTransition}
          className="space-y-8"
        >
          <div className="rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="mb-2 text-2xl font-bold uppercase tracking-tight">
              {copy.introTitle}
            </h2>
            <p className="text-white/60 mb-8 text-sm">
              {copy.introDescription}
            </p>
            <ContactForm dictionary={formDictionary} />
          </div>
        </motion.div>

        {/* Right - Info cards */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <InfoCard index={0}>
            <h3 className="mb-6 text-xl font-bold uppercase tracking-tight">
              {copy.contactInfoTitle}
            </h3>

            <ContactInfoItem label={copy.emailLabel} index={0}>
              <motion.a
                href={`mailto:${copy.emailValue}`}
                className="text-base font-bold hover:text-lime-300 transition-colors break-all"
                whileHover={{ x: 4 }}
              >
                {copy.emailValue}
              </motion.a>
            </ContactInfoItem>

            <ContactInfoItem label={copy.locationLabel} index={1}>
              <p className="text-sm font-bold text-white">
                {copy.locationValue}
              </p>
            </ContactInfoItem>

            <ContactInfoItem label={copy.linkedinLabel} index={2}>
              <motion.a
                href={copy.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-base font-bold hover:text-lime-300 transition-colors"
                whileHover={{ x: 4 }}
              >
                <span>{copy.linkedinCta}</span>
                <span>↗</span>
              </motion.a>
            </ContactInfoItem>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">
                {copy.availabilityLabel}
              </h4>
              <p className="text-sm text-white/70 leading-relaxed">
                {copy.availabilityValue}
              </p>
            </div>
          </InfoCard>

          {/* Services Card */}
          <InfoCard index={1}>
            <h3 className="mb-6 text-xl font-bold uppercase tracking-tight">
              {copy.servicesTitle}
            </h3>
            <ul className="space-y-4 text-sm text-white/70">
              {copy.services.map((service, idx) => (
                <motion.li
                  key={service.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1, ...smoothTransition }}
                  className="flex items-start gap-3"
                >
                  <span className="text-lime-300 font-bold text-base">→</span>
                  <div>
                    <div className="font-bold text-white mb-1">
                      {service.title}
                    </div>
                    <div className="text-xs text-white/50">
                      {service.description}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </InfoCard>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, ...smoothTransition }}
            whileHover={{ scale: 1.02 }}
            className="rounded-[var(--radius-xl)] border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-8 text-center"
          >
            <h3 className="mb-2 text-2xl font-bold uppercase text-[#050505]">
              {copy.consultationTitle}
            </h3>
            <p className="text-sm text-[#050505]/80">
              {copy.consultationDescription}
            </p>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
