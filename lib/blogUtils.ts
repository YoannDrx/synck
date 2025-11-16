import fs from "fs";
import path from "path";
import matter from "gray-matter";
import html from "remark-html";
import { remark } from "remark";
import type { BlogPost, BlogFrontmatter } from "../types";

const postsDirectory = path.join(process.cwd(), "content/posts");

// Fonction helper pour nettoyer les slugs
function cleanSlug(fileName: string): string {
  return fileName
    .replace(/^\d+\.?\s*/, '')        // Retire "10. " ou "10 " au début
    .replace(/\.en\s+/, '.en.')       // Corrige ".en " → ".en."
    .replace(/\.md$/, "")              // Retire .md
    .replace(/\s+/g, '-')              // Espaces → tirets
    .toLowerCase();                    // Minuscules
}

// Récupère les données de tous les articles
export async function getSortedPostsData(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    fileNames.map(async (fileName): Promise<BlogPost> => {
      const id = cleanSlug(fileName);
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      // Utilisation de remark pour transformer le markdown en HTML
      const processedContent = await remark().use(html).process(matterResult.content);
      const contentHtml = processedContent.toString();

      const data = matterResult.data as BlogFrontmatter;

      return {
        id,
        contentHtml,
        title: data.title,
        date: data.date,
        category: data.category,
        thumb: data.thumb,
        subtitle: data.subtitle || null,
        description: data.description || null,
        tags: data.tags || [],
      };
    })
  );

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return -1;
    } else {
      return 1;
    }
  });
}

// Récupère les id de tous les articles
export function getAllPostIds(): Array<{ params: { blogId: string } }> {
  const fileNames = fs.readdirSync(postsDirectory);

  // Retourne un tableau qui contient tous les slugs (identifiants) des articles
  return fileNames.map((fileName) => {
    return {
      params: {
        blogId: cleanSlug(fileName),
      },
    };
  });
}

// Récupère les données d'un article en fonction de son id (slug nettoyé)
export async function getPostData(id: string): Promise<BlogPost> {
  const fileNames = fs.readdirSync(postsDirectory);

  // Trouver le fichier qui correspond au slug
  const fileName = fileNames.find(name => cleanSlug(name) === id);

  if (!fileName) {
    throw new Error(`Post avec slug "${id}" non trouvé`);
  }

  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Utilise gray-matter pour analyser les métadonnées du post
  const matterResult = matter(fileContents);

  // Utilise remark pour convertir le markdown en HTML
  const processedContent = await remark().use(html).process(matterResult.content);
  const contentHtml = processedContent.toString();

  const data = matterResult.data as BlogFrontmatter;

  return {
    id,
    contentHtml,
    title: data.title,
    date: data.date,
    category: data.category,
    thumb: data.thumb,
    subtitle: data.subtitle || null,
    description: data.description || null,
    tags: data.tags || [],
  };
}
