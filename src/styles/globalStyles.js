import { StyleSheet } from 'react-native';
import { width, COVER_WIDTH, COVER_HEIGHT } from '../utils/constants';

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
  chaptersList: {},
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

export default styles;
