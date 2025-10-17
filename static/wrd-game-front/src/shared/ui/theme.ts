// src/theme.ts
import { type ThemeOptions } from '@mui/material/styles';
import './types'; // Assuming this contains your global Window.Telegram type augmentation

/**
 * A mapping of Telegram theme keys to CSS variable names.
 */
const TELEGRAM_VARS = {
  '--tg-theme-bg-color': 'bg_color',
  '--tg-theme-text-color': 'text_color',
  '--tg-theme-hint-color': 'hint_color',
  '--tg-theme-link-color': 'link_color',
  '--tg-theme-button-color': 'button_color',
  '--tg-theme-button-text-color': 'button_text_color',
  '--tg-theme-secondary-bg-color': 'secondary_bg_color',
  '--tg-theme-header-bg-color': 'header_bg_color',
  '--tg-theme-accent-text-color': 'accent_text_color',
  '--tg-theme-section-bg-color': 'section_bg_color',
  '--tg-theme-section-header-text-color': 'section_header_text_color',
  '--tg-theme-subtitle-text-color': 'subtitle_text_color',
  '--tg-theme-destructive-text-color': 'destructive_text_color',
  '--tg-theme-section-separator-color': 'section_separator_color',
} as const;

type TelegramThemeVars = keyof typeof TELEGRAM_VARS;
type TelegramThemeParams = Record<typeof TELEGRAM_VARS[TelegramThemeVars], string>;

/**
 * Helper function to read a CSS variable's computed value from the DOM.
 * @param varName - The name of the CSS variable (e.g., '--tg-theme-bg-color').
 * @param fallback - A fallback color if the variable is not found.
 */
function readCssVar(varName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

/**
 * Applies Telegram theme parameters to the root document as CSS variables.
 * @param themeParams - The theme parameters object from `Telegram.WebApp.themeParams`.
 */
export function applyTelegramTheme(themeParams: Partial<TelegramThemeParams>) {
  const root = document.documentElement;
  for (const cssVar in TELEGRAM_VARS) {
    const themeKey = TELEGRAM_VARS[cssVar as TelegramThemeVars];
    const value = themeParams[themeKey];
    if (value) {
      root.style.setProperty(cssVar, value);
    }
  }
}

/**
 * Creates a reactive Material-UI theme that uses CSS variables populated
 * by the `applyTelegramTheme` function.
 * @param colorScheme - The current color scheme ('light' or 'dark') from Telegram.
 * @returns A Material-UI theme object.
 */
export function createTelegramTheme(colorScheme: 'light' | 'dark'): ThemeOptions {
  return {
    palette: {
      mode: colorScheme,
      primary: {
        main: readCssVar('--tg-theme-button-color', '#5288c1'),
      },
      secondary: {
        main: readCssVar('--tg-theme-accent-text-color', '#6ab3f3'),
      },
      error: {
        main: readCssVar('--tg-theme-destructive-text-color', '#e53935'),
      },
      background: {
        default: readCssVar('--tg-theme-bg-color', '#18222d'),
        paper: readCssVar('--tg-theme-secondary-bg-color', '#232e3c'),
      },
      text: {
        primary: readCssVar('--tg-theme-text-color', '#ffffff'),
        secondary: readCssVar('--tg-theme-subtitle-text-color', '#aaaaaa'),
        disabled: readCssVar('--tg-theme-hint-color', '#777777'),
      },
      action: {
        active: readCssVar('--tg-theme-link-color', '#6ab3f3'),
      },
      divider: readCssVar('--tg-theme-section-separator-color', readCssVar('--tg-theme-hint-color', '#333333')),
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      button: {
        textTransform: 'none',
        fontWeight: 600,
      }
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      // --- Core Components ---
      MuiButton: {
        styleOverrides: {
          root: {
            background: 'var(--tg-theme-button-color)',
            color: 'var(--tg-theme-button-text-color)',
            '&:hover': {
              background: 'var(--tg-theme-button-color)',
              opacity: 0.85,
            },
            '&:disabled': {
              // Proper disabled state
              background: 'var(--tg-theme-hint-color)',
              color: 'var(--tg-theme-bg-color)',
              opacity: 0.5,
            }
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          },
        },
        defaultProps: {
            elevation: 0, // In Telegram, "paper" elements don't have shadows
        }
      },
      // --- App Structure ---
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--tg-theme-header-bg-color)',
            color: 'var(--tg-theme-text-color)',
          },
        },
        defaultProps: {
            elevation: 0,
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--tg-theme-section-bg-color)',
            backgroundImage: 'none', // Remove MUI's default gradient/image
          },
        },
        defaultProps: {
            elevation: 0,
        }
      },
      // --- Icons and Lists ---
      MuiSvgIcon: {
        styleOverrides: {
            // Default color for all icons is the primary text color
            root: {
                color: 'var(--tg-theme-text-color)',
            }
        }
      },
      MuiIconButton: {
        styleOverrides: {
            root: {
                // Interactive icons should use the button/link color
                color: 'var(--tg-theme-button-color)',
            }
        }
      },
      MuiListItemIcon: {
        styleOverrides: {
            root: {
                // Decorative icons in lists should use the hint color
                color: 'var(--tg-theme-hint-color)',
            }
        }
      },
      // --- Form Inputs ---
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            },
            '& .MuiInputBase-input': {
              color: 'var(--tg-theme-text-color)',
            },
            '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: 'var(--tg-theme-hint-color)',
                },
                '&:hover fieldset': {
                    borderColor: 'var(--tg-theme-text-color)',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'var(--tg-theme-link-color)',
                },
            },
            '& label': {
                color: 'var(--tg-theme-hint-color)',
            },
            '& label.Mui-focused': {
                color: 'var(--tg-theme-link-color)',
            },
          },
        },
      },
      // --- Other useful overrides ---
      MuiLink: {
        styleOverrides: {
          root: {
            color: 'var(--tg-theme-link-color)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
            root: {
                color: 'var(--tg-theme-text-color)',
            }
        }
      }
    },
  };
}
