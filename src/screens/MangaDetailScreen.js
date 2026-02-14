import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BackIcon } from '../components/icons';
import { fetchChapters } from '../api/mangadex';
import styles from '../styles/globalStyles';

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.detailTopBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.detailTopBarTitle}>Manga Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailCoverContainer}>
          {manga.cover ? (
            <Image
              source={manga.cover}
              style={styles.detailCover}
              resizeMode="cover"
              onError={() => console.error(`Failed to load cover for ${manga.title}`)}
            />
          ) : (
            <View style={[styles.detailCover, styles.mangaCoverPlaceholder]}>
              <Text style={styles.mangaCoverPlaceholderText}>No Cover</Text>
            </View>
          )}
        </View>

        <View style={styles.detailInfo}>
          <Text style={styles.detailTitle}>{manga.title}</Text>

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
              <Text style={styles.metadataValue}>{manga.year || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {manga.description || 'No description available.'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.readButton, { marginRight: 6 }]}
              onPress={() => {
                if (chapters.length > 0) onChapterPress(chapters[0]);
              }}
            >
              <Text style={styles.readButtonText}>Read Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { marginLeft: 6 }]}>
              <Text style={styles.addButtonText}>Add to Library</Text>
            </TouchableOpacity>
          </View>

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
                      {chapter.pages != null && chapter.pages > 0 && (
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

export default MangaDetailScreen;
