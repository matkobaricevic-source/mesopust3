# Custom Fonts Setup

This directory should contain the following font files:

## Title Font (Oceanwide Semibold)
- `Oceanwide-Semibold.otf`

## Body Text Fonts (YD Yoonche)
- `YDYoonche-Regular.otf`
- `YDYoonche-Medium.otf`
- `YDYoonche-SemiBold.otf`
- `YDYoonche-Bold.otf`

## How to Add Fonts

1. Download the font files (.otf or .ttf format)
2. Place them in this directory: `assets/fonts/`
3. Ensure the filenames match those listed in `app/_layout.tsx`
4. The app will automatically load these fonts on startup

## Font Usage

- **Titles/Headers**: Use `fonts.title` (Oceanwide Semibold)
- **Body Text**: Use `fonts.regular`, `fonts.medium`, `fonts.semiBold`, or `fonts.bold`

Font mappings are defined in `constants/fonts.ts`
