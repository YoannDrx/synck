"use client";

import { useState } from "react";

import type { ContactFormDictionary } from "@/types/dictionary";

type ContactFormProps = {
  dictionary: ContactFormDictionary;
}

export function ContactForm({ dictionary }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? dictionary.error);
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : dictionary.error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.name.label}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder={dictionary.fields.name.placeholder}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.email.label}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder={dictionary.fields.email.placeholder}
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.subject.label}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder={dictionary.fields.subject.placeholder}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          {dictionary.fields.message.label}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full resize-none border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder={dictionary.fields.message.placeholder}
        />
      </div>

      {status === "error" && (
        <div className="border-4 border-red-500 bg-red-500/10 p-4">
          <p className="text-sm font-bold text-red-500">{errorMessage || dictionary.error}</p>
        </div>
      )}

      {status === "success" && (
        <div className="border-4 border-lime-300 bg-lime-300/10 p-4">
          <p className="text-sm font-bold text-lime-300">{dictionary.success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full border-4 border-lime-300 bg-lime-300 px-8 py-4 font-bold uppercase text-[#050505] transition-all hover:bg-transparent hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? dictionary.submit.loading : dictionary.submit.idle}
      </button>
    </form>
  );
}
