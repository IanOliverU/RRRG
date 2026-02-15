import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useState, useEffect } from 'react';
import { fetchMangaFromAPI } from './src/api/mangadex';
import LibraryScreen from './src/screens/LibraryScreen';
import MangaDetailScreen from './src/screens/MangaDetailScreen';
import ChapterReaderScreen from './src/screens/ChapterReaderScreen';
import styles from './src/styles/globalStyles';

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
      setSelectedChapter(null);
    } else {
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
