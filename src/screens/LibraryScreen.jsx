import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SearchIcon, LibraryIcon, UpdatesIcon, HistoryIcon, BrowseIcon, MoreIcon } from '../components/icons';
import styles from '../styles/globalStyles';

const LibraryScreen = ({ onMangaPress, mangaList, isLoading }) => {
  return (
    <>
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

      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabActive}>Default</Text>
          <View style={styles.filterTabUnderline} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterTab, { marginLeft: 16 }]}>
          <Text style={styles.filterTabText}></Text>
        </TouchableOpacity>
      </View>

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
            mangaList.map((manga) => (
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
                      console.error(`Failed to load cover for ${manga.title}:`, error.nativeEvent?.error);
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
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No manga found</Text>
            </View>
          )}
        </ScrollView>
      )}

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

export default LibraryScreen;
