import { ImageSourcePropType } from 'react-native';

const localImages: Record<string, ImageSourcePropType> = {
  '/assets/images/napovidanje.jpg': require('@/assets/images/napovidanje.jpg'),
  '/assets/images/mlada-mesopustova.jpg': require('@/assets/images/mlada-mesopustova.jpg'),
  '/assets/images/Advitor.jpg': require('@/assets/images/Advitor.jpg'),
  '/assets/images/Mesopustari.jpg': require('@/assets/images/Mesopustari.jpg'),
  '/assets/images/Sopci-2.jpg': require('@/assets/images/Sopci-2.jpg'),
  '/assets/images/Misenje-mesopusta.jpg': require('@/assets/images/Misenje-mesopusta.jpg'),
  '/assets/images/Novljansko-kolo.jpg': require('@/assets/images/Novljansko-kolo.jpg'),
  '/assets/images/Pivaci-kola.jpg': require('@/assets/images/Pivaci-kola.jpg'),
  '/assets/images/Zeca.jpg': require('@/assets/images/Zeca.jpg'),
};

export function getImageSource(imageUrl: string | null): ImageSourcePropType | null {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
    return { uri: imageUrl };
  }

  return localImages[imageUrl] || null;
}
