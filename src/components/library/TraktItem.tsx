import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { TraktService, TraktImages } from '../../services/traktService';
import { TMDBService } from '../../services/tmdbService';
import { logger } from '../../utils/logger';

export interface TraktDisplayItem {
  id: string;
  name: string;
  type: 'movie' | 'series';
  poster: string;
  year?: number;
  lastWatched?: string;
  plays?: number;
  rating?: number;
  imdbId?: string;
  traktId: number;
  images?: TraktImages;
}

export const TraktItem = React.memo(({
  item,
  width,
  navigation,
  currentTheme,
  showTitles,
  styles
}: {
  item: TraktDisplayItem;
  width: number;
  navigation: any;
  currentTheme: any;
  showTitles: boolean;
  styles: any;
}) => {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPoster = async () => {
      if (item.images) {
        const url = TraktService.getTraktPosterUrl(item.images);
        if (isMounted && url) {
          setPosterUrl(url);
          return;
        }
      }

      if (item.imdbId || item.traktId) {
        try {
          const tmdbService = TMDBService.getInstance();
          let tmdbId: number | null = null;

          if (item.imdbId) {
            tmdbId = await tmdbService.findTMDBIdByIMDB(item.imdbId);
          }

          if (tmdbId) {
            let posterPath: string | null = null;

            if (item.type === 'movie') {
              const details = await tmdbService.getMovieDetails(String(tmdbId));
              posterPath = details?.poster_path ?? null;
            } else {
              const details = await tmdbService.getTVShowDetails(tmdbId);
              posterPath = details?.poster_path ?? null;
            }

            if (isMounted && posterPath) {
              const url = tmdbService.getImageUrl(posterPath, 'w500');
              setPosterUrl(url);
            }
          }
        } catch (error) {
          logger.debug('Failed to fetch poster from TMDB', error);
        }
      }
    };
    fetchPoster();
    return () => { isMounted = false; };
  }, [item.images, item.imdbId, item.traktId, item.type]);

  const handlePress = useCallback(() => {
    if (item.imdbId) {
      navigation.navigate('Metadata', { id: item.imdbId, type: item.type });
    }
  }, [navigation, item.imdbId, item.type]);

  return (
    <TouchableOpacity
      style={[styles.itemContainer, { width }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View>
        <View style={[styles.posterContainer, { shadowColor: currentTheme.colors.black }]}>
          {posterUrl ? (
            <FastImage
              source={{ uri: posterUrl }}
              style={styles.poster}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={[styles.poster, { backgroundColor: currentTheme.colors.elevation1, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color={currentTheme.colors.primary} />
            </View>
          )}
        </View>
        {showTitles && (
          <Text style={[styles.cardTitle, { color: currentTheme.colors.mediumEmphasis }]}>
            {item.name}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});
