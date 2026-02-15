import React, { useState, useEffect, useRef } from 'react';
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
import { fetchChapterPages } from '../api/mangadex';
import { width } from '../utils/constants';
import styles from '../styles/globalStyles';

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
    setCurrentPage(Math.round(scrollY / pageHeight));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.readerTopBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackIcon size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.readerTitleContainer}>
          <Text style={styles.readerTitle} numberOfLines={1}>
            {mangaTitle}
          </Text>
          <Text style={styles.readerSubtitle}>
            {chapter.chapter === 'Oneshot' ? 'Oneshot' : `Chapter ${chapter.chapter}`}
            {chapter.title ? `: ${chapter.title}` : ''}
          </Text>
        </View>
        <Text style={styles.pageIndicator}>
          {isLoading ? '...' : `${currentPage + 1}/${pages.length}`}
        </Text>
      </View>

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

      {pages.length > 0 && (
        <View style={styles.readerNavButtons}>
          <TouchableOpacity
            style={[styles.navPageButton, currentPage === 0 && styles.navPageButtonDisabled]}
            onPress={handlePreviousPage}
            disabled={currentPage === 0}
          >
            <Text
              style={[
                styles.navPageButtonText,
                currentPage === 0 && styles.navPageButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navPageButton,
              currentPage === pages.length - 1 && styles.navPageButtonDisabled,
            ]}
            onPress={handleNextPage}
            disabled={currentPage === pages.length - 1}
          >
            <Text
              style={[
                styles.navPageButtonText,
                currentPage === pages.length - 1 && styles.navPageButtonTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ChapterReaderScreen;
