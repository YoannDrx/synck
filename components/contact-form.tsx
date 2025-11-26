"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { ContactFormDictionary } from "@/types/dictionary";
import { smoothTransition } from "@/lib/animations";

type ContactFormProps = {
  dictionary: ContactFormDictionary;
};

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      ...smoothTransition,
    },
  }),
};

const statusVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export function ContactForm({ dictionary }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? dictionary.error);
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : dictionary.error,
      );
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const inputClasses =
    "w-full rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-white placeholder:text-white/30 transition-all focus:border-[var(--brand-neon)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-neon)]/30";

  return (
    <motion.form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-6"
      initial="hidden"
      animate="visible"
    >
      {/* Name field */}
      <motion.div variants={fieldVariants} custom={0}>
        <label
          htmlFor="name"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.name.label}
        </label>
        <motion.input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className={inputClasses}
          placeholder={dictionary.fields.name.placeholder}
          whileFocus={{ scale: 1.01 }}
        />
      </motion.div>

      {/* Email field */}
      <motion.div variants={fieldVariants} custom={1}>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.email.label}
        </label>
        <motion.input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={inputClasses}
          placeholder={dictionary.fields.email.placeholder}
          whileFocus={{ scale: 1.01 }}
        />
      </motion.div>

      {/* Subject field */}
      <motion.div variants={fieldVariants} custom={2}>
        <label
          htmlFor="subject"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.subject.label}
        </label>
        <motion.input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className={inputClasses}
          placeholder={dictionary.fields.subject.placeholder}
          whileFocus={{ scale: 1.01 }}
        />
      </motion.div>

      {/* Message field */}
      <motion.div variants={fieldVariants} custom={3}>
        <label
          htmlFor="message"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.message.label}
        </label>
        <motion.textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className={`${inputClasses} resize-none`}
          placeholder={dictionary.fields.message.placeholder}
          whileFocus={{ scale: 1.01 }}
        />
      </motion.div>

      {/* Status messages */}
      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            key="error"
            variants={statusVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-[var(--radius-md)] border-2 border-red-500 bg-red-500/10 p-4"
          >
            <p className="text-sm font-bold text-red-500">
              {errorMessage || dictionary.error}
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            variants={statusVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-[var(--radius-md)] border-2 border-lime-300 bg-lime-300/10 p-4"
          >
            <motion.p
              className="text-sm font-bold text-lime-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {dictionary.success}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.div
        variants={fieldVariants}
        custom={4}
        className="flex justify-end"
      >
        <motion.button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full border-2 border-lime-300 bg-lime-300 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#050505] transition-colors hover:bg-transparent hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
          whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="inline-block h-4 w-4 rounded-full border-2 border-[#050505] border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              {dictionary.submit.loading}
            </span>
          ) : (
            dictionary.submit.idle
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
