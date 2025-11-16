import fs from "fs";
import path from "path";
import matter from "gray-matter";
import html from "remark-html";
import { remark } from "remark";
import type { BlogPost, BlogFrontmatter } from "../types";
import type { Locale } from "./i18n-config";

const postsDirectory = path.join(process.cwd(), "content/posts");

const cleanSlug = (fileName: string) =>
  fileName
    .replace(/^\d+\.?\s*/, "")
    .replace(/\.md$/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

const readPostFileNames = () =>
  fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.toLowerCase().endsWith(".md"));

const deriveSlug = (fileName: string, data: BlogFrontmatter) =>
  (data.slug || cleanSlug(fileName)).trim();

const deriveLang = (data: BlogFrontmatter) => (data.lang || "fr").toLowerCase();

export async function getSortedPostsData(locale?: Locale): Promise<BlogPost[]> {
  const fileNames = readPostFileNames();

  const posts = fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);
    const data = matterResult.data as BlogFrontmatter;
    const slug = deriveSlug(fileName, data);
    const lang = deriveLang(data) as Locale;

    return {
      id: slug,
      slug,
      lang,
      title: data.title,
      date: data.date,
      category: data.category,
      thumb: data.thumb || "",
      subtitle: data.subtitle || null,
      description: data.description || null,
      tags: data.tags || [],
    };
  });

  const filtered = locale ? posts.filter((post) => post.lang === locale) : posts;

  return filtered.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getAllPostIds(locale?: Locale) {
  const posts = await getSortedPostsData(locale);
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

export async function getPostData(slug: string, locale?: Locale): Promise<BlogPost> {
  const fileNames = readPostFileNames();

  for (const fileName of fileNames) {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);
    const data = matterResult.data as BlogFrontmatter;
    const derivedSlug = deriveSlug(fileName, data);
    const lang = deriveLang(data) as Locale;

    if (derivedSlug === slug && (!locale || locale === lang)) {
      const processedContent = await remark().use(html).process(matterResult.content);
      const contentHtml = processedContent.toString();

      return {
        id: derivedSlug,
        slug: derivedSlug,
        lang,
        contentHtml,
        title: data.title,
        date: data.date,
        category: data.category,
        thumb: data.thumb || "",
        subtitle: data.subtitle || null,
        description: data.description || null,
        tags: data.tags || [],
      };
    }
  }

  throw new Error(`Post avec slug "${slug}" non trouvé`);
}
