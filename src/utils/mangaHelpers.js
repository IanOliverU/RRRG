export const getMangaTitle = (manga) => {
  const title = manga.attributes.title;
  return title.en || title['ja-ro'] || title.ja || Object.values(title)[0] || 'Untitled';
};

export const getMangaDescription = (manga) => {
  const desc = manga.attributes.description;
  if (!desc) return 'No description available.';
  return desc.en || desc['ja-ro'] || desc.ja || Object.values(desc)[0] || 'No description available.';
};
