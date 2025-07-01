# Code Structure

This document provides an overview of the project's code structure and module dependencies.

## Module Dependencies

```mermaid
graph LR
  components_ui_Card_index["components/ui/Card/index"] --> components_ui_Card["components/ui/Card"]
  components_ui_Layout["components/ui/Layout"] --> components_ui_CustomCursor["components/ui/CustomCursor"]
  components_ui_Layout["components/ui/Layout"] --> components_ui_Sidebar["components/ui/Sidebar"]
  components_ui_Sidebar["components/ui/Sidebar"] --> components_ui_AmbientPlayer["components/ui/AmbientPlayer"]
  components_ui_Sidebar["components/ui/Sidebar"] --> components_ui_SettingsPanel["components/ui/SettingsPanel"]
  components_ui_Sidebar["components/ui/Sidebar"] --> components_ui_ThemeSwitcher["components/ui/ThemeSwitcher"]
  components_ui_ThemeSwitcher["components/ui/ThemeSwitcher"] --> components_ui_ThemeContext["components/ui/ThemeContext"]
  data_tabs_index["data/tabs/index"] --> data_tabs_demoTabs["data/tabs/demoTabs"]
  data_tabs_index["data/tabs/index"] --> data_tabs_tabCacheService["data/tabs/tabCacheService"]
  lib_ai_songAnalysisService["lib/ai/songAnalysisService"] --> lib_ai_songPrompt["lib/ai/songPrompt"]
  lib_ai_songAnalysisService["lib/ai/songAnalysisService"] --> lib_ai_webSearchMock["lib/ai/webSearchMock"]
  lib_ai_songAnalysisService["lib/ai/songAnalysisService"] --> lib_config["lib/config"]
  lib_config["lib/config"] --> lib_env["lib/env"]
  lib_multiSongApi["lib/multiSongApi"] --> lib_songLinkService["lib/songLinkService"]
  lib_multiSongApi["lib/multiSongApi"] --> lib_songsterrApi["lib/songsterrApi"]
  lib_multiSongApi["lib/multiSongApi"] --> lib_uberchordApi["lib/uberchordApi"]
  lib_musicDiscoveryApi["lib/musicDiscoveryApi"] --> lib_songsterrApi["lib/songsterrApi"]
  lib_musicDiscoveryApi["lib/musicDiscoveryApi"] --> lib_uberchordApi["lib/uberchordApi"]
  lib_rag_embeddings["lib/rag/embeddings"] --> lib_rag_knowledgeBase["lib/rag/knowledgeBase"]
  lib_services_spotifyApi["lib/services/spotifyApi"] --> lib_config["lib/config"]
  lib_services_tabFetcherService["lib/services/tabFetcherService"] --> lib_services_tabScraperService["lib/services/tabScraperService"]
  lib_services_tabScraperService["lib/services/tabScraperService"] --> .._app_services_tabUrlMappings["../app/services/tabUrlMappings"]
  lib_services_tabScraperService["lib/services/tabScraperService"] --> lib_services_tabSearchService["lib/services/tabSearchService"]
  lib_services_tabSearchService["lib/services/tabSearchService"] --> lib_services_tabFetcherService["lib/services/tabFetcherService"]
  lib_services_youtubeApi["lib/services/youtubeApi"] --> lib_config["lib/config"]
  lib_songLinkService["lib/songLinkService"] --> lib_config["lib/config"]
  lib_songLinkService["lib/songLinkService"] --> lib_services_spotifyApi["lib/services/spotifyApi"]
  lib_songLinkService["lib/songLinkService"] --> lib_services_youtubeApi["lib/services/youtubeApi"]
  lib_songLinkService["lib/songLinkService"] --> lib_songsterrApi["lib/songsterrApi"]
  lib_songsterrApi["lib/songsterrApi"] --> lib_services_songsterrApi["lib/services/songsterrApi"]
  lib_tuningUtils["lib/tuningUtils"] --> lib_musicTheory["lib/musicTheory"]
  lib_utils_promptBuilder.test["lib/utils/promptBuilder.test"] --> lib_utils_promptBuilder["lib/utils/promptBuilder"]
  lib_videoResourceCache["lib/videoResourceCache"] --> lib_config["lib/config"]
  lib_videoResourceCache["lib/videoResourceCache"] --> lib_services_youtubeApi["lib/services/youtubeApi"]
  pages_api_chat["pages/api/chat"] --> lib_profiledb["lib/profiledb"]
  pages_api_chat["pages/api/chat"] --> lib_rag_embeddings["lib/rag/embeddings"]
  pages_api_chat["pages/api/chat"] --> lib_utils_promptBuilder["lib/utils/promptBuilder"]
  pages_theory_cheatsheet_index["pages/theory/cheatsheet/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_circle-of-fifths_index["pages/theory/circle-of-fifths/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_ear-training.js_index["pages/theory/ear-training.js/index"] --> components_theory_EarTrainingTool["components/theory/EarTrainingTool"]
  pages_theory_ear-training.js_index["pages/theory/ear-training.js/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_functions_index["pages/theory/functions/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_index["pages/theory/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_piano_index["pages/theory/piano/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_scales_index["pages/theory/scales/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_tonnetz_index["pages/theory/tonnetz/index"] --> components_ui_Layout["components/ui/Layout"]
  pages_theory_tonnetz_index["pages/theory/tonnetz/index"] --> pages_theory_tonnetz_TonnetzPage.module.css["pages/theory/tonnetz/TonnetzPage.module.css"]
```

## Module Descriptions

- **src/pages/**: Next.js page components
- **src/components/**: Reusable UI components
- **src/lib/**: Utility functions and shared logic
- **src/styles/**: Global styles and themes

## How to Update

This diagram is automatically generated. To update it, run:

```bash
node scripts/generate-docs.js
```
