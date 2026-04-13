import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { MaterialIcons } from '@expo/vector-icons';
import { StreamingContent } from '../../services/catalogService';

export interface LibraryItem extends StreamingContent {
  progress?: number;
  lastWatched?: string;
  gradient: [string, string];
  imdbId?: string;
  traktId: number;
  watched?: boolean;
}

interface LocalLibraryItemProps {
  item: LibraryItem;
  itemWidth: number;
  navigation: any;
  currentTheme: any;
  settings: any;
  styles: any;
  setSelectedItem: (item: LibraryItem) => void;
  setMenuVisible: (visible: boolean) => void;
}

export const LocalLibraryItem = React.memo(({
  item,
  itemWidth,
  navigation,
  currentTheme,
  settings,
  styles,
  setSelectedItem,
  setMenuVisible
}: LocalLibraryItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, { width: itemWidth }]}
      onPress={() => navigation.navigate('Metadata', { id: item.id, type: item.type })}
      onLongPress={() => {
        setSelectedItem(item);
        setMenuVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View>
        <View style={[styles.posterContainer, { shadowColor: currentTheme.colors.black, borderRadius: settings.posterBorderRadius ?? 12 }]}>
          <FastImage
            source={{ uri: item.poster || 'https://via.placeholder.com/300x450' }}
            style={[styles.poster, { borderRadius: settings.posterBorderRadius ?? 12 }]}
            resizeMode={FastImage.resizeMode.cover}
          />
          {item.watched && (
            <View style={styles.watchedIndicator}>
              <MaterialIcons name="check-circle" size={22} color={currentTheme.colors.success || '#4CAF50'} />
            </View>
          )}
          {item.progress !== undefined && item.progress < 1 && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${item.progress * 100}%`, backgroundColor: currentTheme.colors.primary }
                ]}
              />
            </View>
          )}
        </View>
        {settings.showPosterTitles && (
          <Text style={[styles.cardTitle, { color: currentTheme.colors.mediumEmphasis }]}>
            {item.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});
