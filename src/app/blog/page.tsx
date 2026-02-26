import type { Metadata } from "next";
import { blogPosts, blogCategories } from "@/data/blogPosts";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog Esotérico — Astrologia, Cristais e Espiritualidade | ASTRALMIA",
  description: "Artigos aprofundados sobre astrologia, cristais, tarot, rituais e espiritualidade. Aprenda com Caela o significado de Mercúrio Retrógrado, cristais de proteção, mapas astrais e muito mais.",
  keywords: [
    "blog esotérico",
    "astrologia artigos",
    "cristais de proteção",
    "mercúrio retrógrado",
    "tarot",
    "rituais espirituais",
    "chakras",
    "numerologia",
    "espiritualidade",
    "mapa astral",
  ],
  openGraph: {
    title: "Blog Esotérico | ASTRALMIA",
    description: "Artigos aprofundados sobre astrologia, cristais, tarot e espiritualidade.",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogPageClient posts={blogPosts} categories={blogCategories} />;
}
