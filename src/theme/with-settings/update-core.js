import { setFont, hexToRgbChannel, createPaletteChannel } from 'minimal-shared/utils';

import { primaryColorPresets } from './color-presets';
import { createShadowColor } from '../core/custom-shadows';

// ----------------------------------------------------------------------

/**
 * Update the core theme with the settings state.
 * @contrast
 * @primaryColor
 */

export function updateCoreWithSettings(theme, settingsState) {
  // Handle case when settingsState is undefined or null
  if (!settingsState || typeof settingsState !== 'object') {
    return theme;
  }

  const { direction, fontFamily, contrast = 'default', primaryColor = 'default' } = settingsState;

  const isDefaultContrast = contrast === 'default';
  const isDefaultPrimaryColor = primaryColor === 'default';

  const lightPalette = theme.colorSchemes?.light.palette;

  // Ensure we have a valid primary color preset
  const primaryColorData = primaryColorPresets[primaryColor] || primaryColorPresets.default;
  const updatedPrimaryColor = primaryColorData ? createPaletteChannel(primaryColorData) : null;
  // const updatedSecondaryColor = createPaletteChannel(SECONDARY_COLORS[primaryColor!]);

  const updateColorScheme = (scheme) => {
    const colorSchemes = theme.colorSchemes?.[scheme];

    const updatedPalette = {
      ...colorSchemes?.palette,
      ...(!isDefaultPrimaryColor &&
        updatedPrimaryColor && {
          primary: updatedPrimaryColor,
          // secondary: updatedSecondaryColor,
        }),
      ...(scheme === 'light' && {
        background: {
          ...lightPalette?.background,
          ...(!isDefaultContrast && {
            default: lightPalette.grey[200],
            defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
          }),
        },
      }),
    };

    const updatedCustomShadows = {
      ...colorSchemes?.customShadows,
      ...(!isDefaultPrimaryColor && {
        primary: createShadowColor(updatedPrimaryColor.mainChannel),
        // secondary: createShadowColor(updatedSecondaryColor.mainChannel),
      }),
    };

    return {
      ...colorSchemes,
      palette: updatedPalette,
      customShadows: updatedCustomShadows,
    };
  };

  return {
    ...theme,
    direction,
    colorSchemes: {
      light: updateColorScheme('light'),
      dark: updateColorScheme('dark'),
    },
    typography: {
      ...theme.typography,
      fontFamily: setFont(fontFamily),
    },
  };
}
