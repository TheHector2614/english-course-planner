const UNSPLASH_ACCESS_KEY = import.meta.env.UNSPLASH_ACCESS_KEY || "";
const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";

export const hasUnsplashKey = !!UNSPLASH_ACCESS_KEY;

interface UnsplashResult {
  url: string;
  author: string;
  authorUrl: string;
}

export async function getImageForWord(word: string): Promise<UnsplashResult | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;
  try {
    const res = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(word)}&per_page=1&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const img = data.results?.[0];
    if (!img) return null;
    return { url: img.urls.regular, author: img.user.name, authorUrl: img.user.links.html };
  } catch {
    return null;
  }
}

export async function searchUnsplashImages(query: string): Promise<UnsplashResult[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];
  try {
    const res = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=6&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((img: any) => ({
      url: img.urls.regular,
      author: img.user.name,
      authorUrl: img.user.links.html,
    }));
  } catch {
    return [];
  }
}
