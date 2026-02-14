import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const COVER_WIDTH = (width - 48) / 3;
export const COVER_HEIGHT = COVER_WIDTH * 1.4;
export { width };
