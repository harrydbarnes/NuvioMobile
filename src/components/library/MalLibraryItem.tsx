import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { MalAnimeNode } from '../../types/mal';

interface MalLibraryItemProps {
  item: MalAnimeNode;
  itemWidth: number;
  navigation: any;
  currentTheme: any;
  settings: any;
  styles: any;
}

export const MalLibraryItem = React.memo(({
  item,
  itemWidth,
  navigation,
  currentTheme,
  settings,
  styles
}: MalLibraryItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, { width: itemWidth }]}
      onPress={() => navigation.navigate('Metadata', {
          id: `mal:${item.node.id}`,
          type: item.node.media_type === 'movie' ? 'movie' : 'series'
      })}
      activeOpacity={0.7}
    >
      <View>
        <View style={[styles.posterContainer, { shadowColor: currentTheme.colors.black, borderRadius: settings.posterBorderRadius ?? 12 }]}>
          <FastImage
            source={{ uri: item.node.main_picture?.large || item.node.main_picture?.medium || 'https://via.placeholder.com/300x450' }}
            style={[styles.poster, { borderRadius: settings.posterBorderRadius ?? 12 }]}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.malBadge}>
             <Text style={styles.malBadgeText}>{item.list_status.status.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                      width: `${(item.list_status.num_episodes_watched / (item.node.num_episodes || 1)) * 100}%`,
                      backgroundColor: '#2E51A2'
                  }
                ]}
              />
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: currentTheme.colors.mediumEmphasis }]} numberOfLines={2}>
          {item.node.title}
        </Text>
        <Text style={[styles.malScore, { color: '#F5C518' }]}>
           ★ {item.list_status.score > 0 ? item.list_status.score : '-'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
