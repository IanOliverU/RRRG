import axios from 'axios';
import { getMangaTitle, getMangaDescription } from '../utils/mangaHelpers';

const fetchCoverArtFromEndpoint = async (coverArtId) => {
  try {
    const response = await axios.get(`https://api.mangadex.org/cover/${coverArtId}`);
    if (response.data && response.data.data && response.data.data.attributes?.fileName) {
      return response.data.data.attributes.fileName;
    }
  } catch (error) {
    console.error(`Error fetching cover art ${coverArtId} from endpoint:`, error);
  }
  return null;
};

export const getCoverArtUrl = async (manga, included) => {
  try {
    const coverArtRel = manga.relationships?.find(rel => rel.type === 'cover_art');

    if (coverArtRel && coverArtRel.id) {
      const coverArt = included?.find(item =>
        item.id === coverArtRel.id && item.type === 'cover_art'
      );

      let fileName = null;
      if (coverArt) {
        fileName = coverArt.attributes?.fileName;
      } else {
        fileName = await fetchCoverArtFromEndpoint(coverArtRel.id);
      }

      if (fileName) {
        const normalizedFileName = fileName.trim();
        return `https://uploads.mangadex.org/covers/${manga.id}/${normalizedFileName}.512.jpg`;
      }
    }
  } catch (error) {
    console.error('Error getting cover art URL:', error);
  }
  return null;
};

export const fetchMangaFromAPI = async (limit = 100) => {
  try {
    const fetchLimit = Math.min(limit, 100);
    const includes = ['cover_art', 'author', 'artist'];
    const contentRatings = ['safe', 'suggestive'];
    let queryString = `limit=${fetchLimit}&order[followedCount]=desc`;
    includes.forEach(inc => { queryString += `&includes[]=${inc}`; });
    contentRatings.forEach(rating => { queryString += `&contentRating[]=${rating}`; });

    const response = await axios.get(`https://api.mangadex.org/manga?${queryString}`);

    if (response.data && response.data.data) {
      const included = response.data.included || [];
      const allMangas = await Promise.all(
        response.data.data.map(async (manga) => {
          const coverUrl = await getCoverArtUrl(manga, included);
          return {
            id: manga.id,
            title: getMangaTitle(manga),
            description: getMangaDescription(manga),
            cover: coverUrl ? { uri: coverUrl } : null,
            status: manga.attributes.status,
            lastChapter: manga.attributes.lastChapter,
            lastVolume: manga.attributes.lastVolume,
            tags: manga.attributes.tags?.map(tag => tag.attributes.name.en || tag.attributes.name) || [],
            year: manga.attributes.year,
            contentRating: manga.attributes.contentRating,
          };
        })
      );
      const mangasWithCovers = allMangas.filter(manga => manga.cover !== null);
      if (mangasWithCovers.length > 0) {
        return mangasWithCovers.slice(0, limit);
      }
      return allMangas.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching manga:', error);
    return [];
  }
};

export const fetchChapters = async (mangaId, limit = 100) => {
  try {
    const queryString = `limit=${limit}&order[chapter]=desc&translatedLanguage[]=en`;
    const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed?${queryString}`);

    if (response.data && response.data.data) {
      const chapters = response.data.data.map((chapter) => {
        const pages = chapter.attributes?.pages || chapter.attributes?.pageCount || null;
        return {
          id: chapter.id,
          chapter: chapter.attributes.chapter || 'Oneshot',
          title: chapter.attributes.title || '',
          pages,
          publishAt: chapter.attributes.publishAt,
          volume: chapter.attributes.volume,
        };
      });
      return chapters.sort((a, b) => {
        const aNum = parseFloat(a.chapter) || 0;
        const bNum = parseFloat(b.chapter) || 0;
        return bNum - aNum;
      });
    }
    return [];
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

export const fetchChapterPageCount = async (chapterId) => {
  try {
    const serverResponse = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    if (serverResponse.data && serverResponse.data.chapter) {
      const data = serverResponse.data.chapter.data || serverResponse.data.chapter.dataSaver || [];
      return data.length;
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching page count for chapter ${chapterId}:`, error);
    return 0;
  }
};

export const fetchChapterPages = async (chapterId, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const serverResponse = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
      if (serverResponse.data) {
        const { baseUrl, chapter } = serverResponse.data;
        const { hash, data } = chapter;
        return data.map(page => `${baseUrl}/data/${hash}/${page}`);
      }
      return [];
    } catch (error) {
      if (error.response?.status === 429) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      console.error('Error fetching chapter pages:', error);
      if (i === retries - 1) return [];
    }
  }
  return [];
};
