import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const COVER_WIDTH = (width - 48) / 3; // 3 columns with padding
const COVER_HEIGHT = COVER_WIDTH * 1.4; // Aspect ratio for manga covers

// Debug: Log dimensions
console.log('Screen dimensions - width:', width, 'COVER_WIDTH:', COVER_WIDTH, 'COVER_HEIGHT:', COVER_HEIGHT);

// MangaDex API helper functions
const getMangaTitle = (manga) => {
  const title = manga.attributes.title;
  return title.en || title['ja-ro'] || title.ja || Object.values(title)[0] || 'Untitled';
};

const getMangaDescription = (manga) => {
  const desc = manga.attributes.description;
  if (!desc) return 'No description available.';
  return desc.en || desc['ja-ro'] || desc.ja || Object.values(desc)[0] || 'No description available.';  an
};

// Fetch cover art from MangaDex cover endpoint (fallback method)
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

const getCoverArtUrl = async (manga, included) => {
  try {
    // Debug: Log relationships and included
    console.log('=== getCoverArtUrl Debug ===');
    console.log('Manga ID:', manga.id);
    console.log('Manga relationships:', manga.relationships);
    console.log('Included array length:', included?.length || 0);
    console.log('Included types:', included?.map(item => item.type).filter((v, i, a) => a.indexOf(v) === i) || []);
    
    // Find cover art relationship
    const coverArtRel = manga.relationships?.find(rel => rel.type === 'cover_art');
    
    if (coverArtRel && coverArtRel.id) {
      console.log(`Found cover_art relationship with ID: ${coverArtRel.id}`);
      
      // Try to find cover art in included array
      const coverArt = included?.find(item => {
        // Match by both id and type
        return item.id === coverArtRel.id && item.type === 'cover_art';
      });
      
      let fileName = null;
      
      if (coverArt) {
        console.log('Cover art found in included array');
        fileName = coverArt.attributes?.fileName;
      } else {
        // Included array is empty or doesn't have this cover - fetch from endpoint
        console.log(`Cover art NOT in included, fetching from /cover/${coverArtRel.id} endpoint`);
        fileName = await fetchCoverArtFromEndpoint(coverArtRel.id);
      }
      
      if (fileName) {
        // MangaDex cover art URL format: append size suffix without stripping extension
        const normalizedFileName = fileName.trim();
        const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${normalizedFileName}.512.jpg`;
        
        console.log('Cover URL:', coverUrl);
        return coverUrl;
      } else {
        console.log(`No fileName found for cover art ${coverArtRel.id}`);
      }
    } else {
      // No cover art relationship found
      console.log(`No cover_art relationship found for manga ${manga.id}`);
      if (manga.relationships && manga.relationships.length > 0) {
        const relTypes = manga.relationships.map(rel => rel.type);
        console.log(`Available relationship types:`, relTypes);
      } else {
        console.log(`No relationships found for manga ${manga.id}`);
      }
    }
  } catch (error) {
    console.error('Error getting cover art URL:', error);
    console.error('Manga ID:', manga?.id);
  }
  return null;
};

// Fetch manga from MangaDex API
const fetchMangaFromAPI = async (limit = 100) => {
  try {
    // Build query string manually for MangaDex API format
    // MangaDex API max limit is 100, so we fetch 100 and filter for those with covers
    const fetchLimit = Math.min(limit, 100);
    const includes = ['cover_art', 'author', 'artist'];
    const contentRatings = ['safe', 'suggestive'];
    let queryString = `limit=${fetchLimit}&order[followedCount]=desc`;
    includes.forEach(inc => {
      queryString += `&includes[]=${inc}`;
    });
    contentRatings.forEach(rating => {
      queryString += `&contentRating[]=${rating}`;
    });
    
    const response = await axios.get(`https://api.mangadex.org/manga?${queryString}`);

    // Debug: Check API response structure
    console.log('=== API Response Debug ===');
    console.log('response.data exists:', !!response.data);
    console.log('response.data.data exists:', !!response.data?.data);
    console.log('response.data.included exists:', !!response.data?.included);
    console.log('Number of mangas:', response.data?.data?.length || 0);
    console.log('Number of included items:', response.data?.included?.length || 0);

    if (response.data && response.data.data) {
      const included = response.data.included || [];
      
      // Debug: Check first manga structure
      if (response.data.data.length > 0) {
        const firstManga = response.data.data[0];
        console.log('=== First Manga Sample ===');
        console.log('First manga ID:', firstManga.id);
        console.log('First manga title:', getMangaTitle(firstManga));
        console.log('First manga relationships:', firstManga.relationships);
        console.log('First manga relationships (formatted):', firstManga.relationships?.map(r => ({ type: r.type, id: r.id })));
        
        // Check if cover_art relationship exists
        const firstCoverRel = firstManga.relationships?.find(rel => rel.type === 'cover_art');
        console.log('First manga cover_art relationship:', firstCoverRel);
        
        // Check included array
        console.log('Included array length:', included.length);
        const includedTypes = included.map(item => item.type).filter((v, i, a) => a.indexOf(v) === i);
        console.log('Included types:', includedTypes);
        
        const firstCoverArt = included.find(item => item.type === 'cover_art');
        if (firstCoverArt) {
          console.log('Sample cover art in included:', {
            id: firstCoverArt.id,
            type: firstCoverArt.type,
            fileName: firstCoverArt.attributes?.fileName,
            attributes: Object.keys(firstCoverArt.attributes || {})
          });
        } else {
          console.log('No cover_art found in included array');
        }
      }
      
      // Map all mangas and try to get cover art (now async)
      const allMangas = await Promise.all(
        response.data.data.map(async (manga) => {
          const coverUrl = await getCoverArtUrl(manga, included);
          
          const mangaObj = {
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
          
          // Debug: Log what we're storing
          console.log(`Manga: ${mangaObj.title} - Cover:`, mangaObj.cover);
          
          return mangaObj;
        })
      );
      
      // Filter to only mangas with covers, then limit
      // If we have mangas with covers, use those. Otherwise, show all mangas (they'll show without covers)
      const mangasWithCovers = allMangas.filter(manga => manga.cover !== null);
      
      console.log(`After filtering: ${mangasWithCovers.length} mangas with covers out of ${allMangas.length} total`);
      
      // If we have mangas with covers, return those (limited). Otherwise return all mangas (limited)
      if (mangasWithCovers.length > 0) {
        return mangasWithCovers.slice(0, limit);
      } else {
        // If no covers found, return all mangas (they'll display without images)
        console.log('No mangas with covers found, returning all mangas');
        return allMangas.slice(0, limit);
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching manga:', error);
    return [];
  }
};

// Fetch chapters for a specific manga
const fetchChapters = async (mangaId, limit = 100) => {
  try {
    let queryString = `limit=${limit}&order[chapter]=desc&translatedLanguage[]=en`;
    const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed?${queryString}`);
    
    if (response.data && response.data.data) {
      const chapters = response.data.data.map((chapter) => {
        // Check multiple possible locations for pages count
        const pages = chapter.attributes?.pages || 
                     chapter.attributes?.pageCount || 
                     null;
        
        return {
          id: chapter.id,
          chapter: chapter.attributes.chapter || 'Oneshot',
          title: chapter.attributes.title || '',
          pages: pages, // Will be null if not available - we'll fetch on demand
          publishAt: chapter.attributes.publishAt,
          volume: chapter.attributes.volume,
        };
      });
      
      // Don't fetch page counts automatically to avoid rate limiting
      // Page counts will be fetched when user opens a chapter
      
      return chapters.sort((a, b) => {
        // Sort by chapter number (handle numeric and string)
        const aNum = parseFloat(a.chapter) || 0;
        const bNum = parseFloat(b.chapter) || 0;
        return bNum - aNum; // Descending order (newest first)
      });
    }
    return [];
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

// Fetch page count for a single chapter (called on demand)
const fetchChapterPageCount = async (chapterId) => {
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

// Fetch chapter pages with retry logic for rate limiting
const fetchChapterPages = async (chapterId, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // First get the chapter server info
      const serverResponse = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
      
      if (serverResponse.data) {
        const { baseUrl, chapter } = serverResponse.data;
        const { hash, data } = chapter;
        
        // Build page URLs
        const pageUrls = data.map(page => 
          `${baseUrl}/data/${hash}/${page}`
        );
        
        return pageUrls;
      }
      return [];
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited - wait before retrying
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      console.error('Error fetching chapter pages:', error);
      if (i === retries - 1) {
        return [];
      }
    }
  }
  return [];
};

// Search Icon SVG Component
const SearchIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Library Icon (Bookmark)
const LibraryIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Updates Icon (Bell)
const UpdatesIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8C6 11.0909 3.9091 13.6364 3 14L21 14C20.0909 13.6364 18 11.0909 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// History Icon (Clock)
const HistoryIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8V12L15 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Browse Icon (Compass)
const BrowseIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 6L15.09 8.26L18 6L16.74 9.09L19 12L15.91 12L14.65 15.09L12 18L8.91 15.74L6 18L7.26 14.91L5 12L8.09 12L9.35 8.91L12 6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// More Icon (Three Dots)
const MoreIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
      fill={color}
    />
    <Path
      d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
      fill={color}
    />
    <Path
      d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
      fill={color}
    />
  </Svg>
);

// Back Arrow Icon
const BackIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Manga Detail Screen Component
const MangaDetailScreen = ({ manga, onBack, onChapterPress }) => {
  const [chapters, setChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      setIsLoadingChapters(true);
      const fetchedChapters = await fetchChapters(manga.id);
      setChapters(fetchedChapters);
      setIsLoadingChapters(false);
    };
    loadChapters();
  }, [manga.id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Bar with Back Button */}
      <View style={styles.detailTopBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.detailTopBarTitle}>Manga Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.detailCoverContainer}>
          {manga.cover ? (
            <Image 
              source={manga.cover} 
              style={styles.detailCover}
              resizeMode="cover"
              onError={(error) => {
                console.error(`Failed to load cover for ${manga.title}:`, error.nativeEvent.error);
                console.error('Cover URL:', manga.cover?.uri);
              }}
              onLoad={() => {
                console.log(`Successfully loaded cover for ${manga.title}`);
              }}
            />
          ) : (
            <View style={[styles.detailCover, styles.mangaCoverPlaceholder]}>
              <Text style={styles.mangaCoverPlaceholderText}>No Cover</Text>
            </View>
          )}
        </View>

        {/* Title and Info */}
        <View style={styles.detailInfo}>
          <Text style={styles.detailTitle}>{manga.title}</Text>
          
          {/* Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Status</Text>
              <Text style={styles.metadataValue}>
                {manga.status ? manga.status.charAt(0).toUpperCase() + manga.status.slice(1) : 'Unknown'}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Chapters</Text>
              <Text style={styles.metadataValue}>
                {chapters.length || manga.lastChapter || 'N/A'}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Year</Text>
              <Text style={styles.metadataValue}>
                {manga.year || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {manga.description || 'No description available.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.readButton, { marginRight: 6 }]}
              onPress={() => {
                if (chapters.length > 0) {
                  onChapterPress(chapters[0]);
                }
              }}
            >
              <Text style={styles.readButtonText}>Read Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { marginLeft: 6 }]}>
              <Text style={styles.addButtonText}>Add to Library</Text>
            </TouchableOpacity>
          </View>

          {/* Chapters Section */}
          <View style={styles.chaptersContainer}>
            <Text style={styles.chaptersTitle}>Chapters</Text>
            {isLoadingChapters ? (
              <View style={styles.chaptersLoadingContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.chaptersLoadingText}>Loading chapters...</Text>
              </View>
            ) : chapters.length > 0 ? (
              <View style={styles.chaptersList}>
                {chapters.map((chapter) => (
                  <TouchableOpacity 
                    key={chapter.id} 
                    style={styles.chapterItem}
                    onPress={() => onChapterPress(chapter)}
                  >
                    <View>
                      <Text style={styles.chapterText}>
                        {chapter.chapter === 'Oneshot' ? 'Oneshot' : `Chapter ${chapter.chapter}`}
                        {chapter.title ? `: ${chapter.title}` : ''}
                      </Text>
                      {chapter.pages && chapter.pages > 0 && (
                        <Text style={styles.chapterPages}>{chapter.pages} pages</Text>
                      )}
                    </View>
                    <Text style={styles.chapterDate}>{formatDate(chapter.publishAt)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.chaptersEmptyContainer}>
                <Text style={styles.chaptersEmptyText}>No chapters available</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Chapter Reader Screen Component
const ChapterReaderScreen = ({ chapter, mangaTitle, onBack }) => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const loadPages = async () => {
      setIsLoading(true);
      const pageUrls = await fetchChapterPages(chapter.id);
      setPages(pageUrls);
      setIsLoading(false);
    };
    loadPages();
  }, [chapter.id]);

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      scrollViewRef.current?.scrollTo({
        y: newPage * width * 1.5,
        animated: true,
      });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      scrollViewRef.current?.scrollTo({
        y: newPage * width * 1.5,
        animated: true,
      });
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const pageHeight = width * 1.5;
    const page = Math.round(scrollY / pageHeight);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Bar */}
      <View style={styles.readerTopBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.readerTitleContainer}>
          <Text style={styles.readerTitle} numberOfLines={1}>{mangaTitle}</Text>
          <Text style={styles.readerSubtitle}>
            {chapter.chapter === 'Oneshot' ? 'Oneshot' : `Chapter ${chapter.chapter}`}
            {chapter.title ? `: ${chapter.title}` : ''}
          </Text>
        </View>
        <Text style={styles.pageIndicator}>
          {isLoading ? '...' : `${currentPage + 1}/${pages.length}`}
        </Text>
      </View>

      {/* Reader Content */}
      {isLoading ? (
        <View style={styles.readerLoadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.readerLoadingText}>Loading pages...</Text>
        </View>
      ) : pages.length > 0 ? (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.readerContent}
          contentContainerStyle={styles.readerPagesContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {pages.map((pageUrl, index) => (
            <Image
              key={index}
              source={{ uri: pageUrl }}
              style={styles.readerPage}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.readerErrorContainer}>
          <Text style={styles.readerErrorText}>Failed to load chapter pages</Text>
        </View>
      )}

      {/* Navigation Buttons */}
      {pages.length > 0 && (
        <View style={styles.readerNavButtons}>
          <TouchableOpacity 
            style={[styles.navPageButton, currentPage === 0 && styles.navPageButtonDisabled]}
            onPress={handlePreviousPage}
            disabled={currentPage === 0}
          >
            <Text style={[styles.navPageButtonText, currentPage === 0 && styles.navPageButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navPageButton, currentPage === pages.length - 1 && styles.navPageButtonDisabled]}
            onPress={handleNextPage}
            disabled={currentPage === pages.length - 1}
          >
            <Text style={[styles.navPageButtonText, currentPage === pages.length - 1 && styles.navPageButtonTextDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Library Screen Component
const LibraryScreen = ({ onMangaPress, mangaList, isLoading }) => {
  // Debug: Log manga list and cover info before rendering
  console.log('=== LibraryScreen Render Debug ===');
  console.log('mangaList length:', mangaList.length);
  console.log('COVER_WIDTH:', COVER_WIDTH);
  console.log('COVER_HEIGHT:', COVER_HEIGHT);
  
  if (mangaList.length > 0) {
    console.log('First 3 mangas in list:');
    mangaList.slice(0, 3).forEach((manga, index) => {
      console.log(`Manga ${index + 1}:`, {
        id: manga.id,
        title: manga.title,
        cover: manga.cover,
        coverType: typeof manga.cover,
        coverUri: manga.cover?.uri
      });
    });
  }
  
  return (
    <>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Library</Text>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <SearchIcon size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 16 }]}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 16 }]}>
            <Text style={styles.iconText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabActive}>Default</Text>
          <View style={styles.filterTabUnderline} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, { marginLeft: 16 }]}>
          <Text style={styles.filterTabText}></Text>
        </TouchableOpacity>
      </View>

      {/* Content Area - Manga Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading manga...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.contentArea}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          {mangaList.length > 0 ? (
            <>
              {/* TEST IMAGE - Uncomment to test if Image component works */}
              {/* <TouchableOpacity style={styles.mangaItem}>
                <Image 
                  source={{ uri: 'https://placekitten.com/300/400' }}
                  style={styles.mangaCover}
                  resizeMode="cover"
                  onLoad={() => console.log('✅ Test image loaded successfully')}
                  onError={(e) => console.error('❌ Test image failed:', e.nativeEvent.error)}
                />
                <Text style={styles.mangaTitle}>Test Image</Text>
              </TouchableOpacity> */}
              
              {mangaList.map((manga) => {
                // Debug: Log each manga before rendering
                console.log(`Rendering manga: ${manga.title} - Cover:`, manga.cover);
                
                return (
                  <TouchableOpacity 
                    key={manga.id} 
                    style={styles.mangaItem}
                    onPress={() => onMangaPress(manga)}
                  >
                    {manga.cover ? (
                      <Image 
                        source={manga.cover} 
                        style={styles.mangaCover}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error(`❌ Failed to load cover for ${manga.title}:`, error.nativeEvent.error);
                          console.error('Cover URL:', manga.cover?.uri);
                          console.error('Error details:', error.nativeEvent);
                        }}
                        onLoad={() => {
                          console.log(`✅ Successfully loaded cover for ${manga.title}`);
                          console.log('Cover URL:', manga.cover?.uri);
                        }}
                      />
                    ) : (
                      <View style={[styles.mangaCover, styles.mangaCoverPlaceholder]}>
                        <Text style={styles.mangaCoverPlaceholderText}>No Cover</Text>
                      </View>
                    )}
                    <Text style={styles.mangaTitle} numberOfLines={2}>
                      {manga.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No manga found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <LibraryIcon size={20} color="#2196F3" />
          </View>
          <Text style={styles.navLabelActive}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <UpdatesIcon size={20} color="#666" />
          </View>
          <Text style={styles.navLabel}>Updates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <HistoryIcon size={20} color="#666" />
          </View>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <BrowseIcon size={20} color="#666" />
          </View>
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <MoreIcon size={20} color="#666" />
          </View>
          <Text style={styles.navLabel}>More</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default function App() {
  const [selectedManga, setSelectedManga] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadManga = async () => {
      setIsLoading(true);
      const manga = await fetchMangaFromAPI(100);
      setMangaList(manga);
      setIsLoading(false);
    };
    loadManga();
  }, []);

  const handleMangaPress = (manga) => {
    setSelectedManga(manga);
    setSelectedChapter(null);
  };

  const handleBack = () => {
    if (selectedChapter) {
      // If in chapter reader, go back to manga detail
      setSelectedChapter(null);
    } else {
      // If in manga detail, go back to library
      setSelectedManga(null);
    }
  };

  const handleChapterPress = (chapter) => {
    setSelectedChapter(chapter);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {selectedChapter ? (
        <ChapterReaderScreen 
          chapter={selectedChapter}
          mangaTitle={selectedManga?.title || 'Unknown'}
          onBack={handleBack}
        />
      ) : selectedManga ? (
        <MangaDetailScreen 
          manga={selectedManga} 
          onBack={handleBack}
          onChapterPress={handleChapterPress}
        />
      ) : (
        <LibraryScreen 
          onMangaPress={handleMangaPress} 
          mangaList={mangaList}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  topBarIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    position: 'relative',
  },
  filterTabActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  filterTabText: {
    fontSize: 20,
  },
  filterTabUnderline: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2196F3',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  mangaItem: {
    width: COVER_WIDTH,
    marginBottom: 16,
  },
  mangaCover: {
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  mangaTitle: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIconContainer: {
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: '#666',
  },
  navLabelActive: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  // Detail Screen Styles
  detailTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  detailTopBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 32,
  },
  detailContent: {
    flex: 1,
  },
  detailCoverContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  detailCover: {
    width: width * 0.4,
    height: width * 0.56,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  detailInfo: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  readButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  chaptersContainer: {
    marginBottom: 20,
  },
  chaptersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  chaptersList: {
  },
  chapterItem: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chapterText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  chapterDate: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  // Chapter Reader Styles
  readerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  readerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  readerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  readerSubtitle: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 2,
  },
  pageIndicator: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  readerContent: {
    flex: 1,
    backgroundColor: '#000',
  },
  readerPagesContainer: {
    alignItems: 'center',
  },
  readerPage: {
    width: width,
    height: width * 1.5,
    backgroundColor: '#000',
  },
  readerLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  readerLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  readerErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  readerErrorText: {
    fontSize: 16,
    color: '#fff',
  },
  readerNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navPageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  navPageButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  navPageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navPageButtonTextDisabled: {
    color: '#999',
  },
  // Chapter List Styles
  chaptersLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  chaptersLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  chaptersEmptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  chaptersEmptyText: {
    fontSize: 14,
    color: '#666',
  },
  chapterPages: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  mangaCoverPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mangaCoverPlaceholderText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});
