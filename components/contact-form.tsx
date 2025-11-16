"use client";

import { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          Nom complet *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder="Votre nom"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder="votre@email.com"
        />
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          Sujet *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder="Objet de votre message"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs font-bold uppercase tracking-wider text-lime-300"
        >
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full resize-none border-4 border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors"
          placeholder="Votre message..."
        />
      </div>

      {/* Status Messages */}
      {status === "error" && (
        <div className="border-4 border-red-500 bg-red-500/10 p-4">
          <p className="text-sm font-bold text-red-500">{errorMessage}</p>
        </div>
      )}

      {status === "success" && (
        <div className="border-4 border-lime-300 bg-lime-300/10 p-4">
          <p className="text-sm font-bold text-lime-300">
            Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full border-4 border-lime-300 bg-lime-300 px-8 py-4 font-bold uppercase text-[#050505] transition-all hover:bg-transparent hover:text-lime-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
