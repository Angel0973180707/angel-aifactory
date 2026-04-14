# Story Video Factory v1

這是第一版 PWA 骨架，包含：
- Dashboard
- Story Pool
- Video Factory
- Publish Factory
- 假資料流與本地 mock 生成

## 下一步
1. 用 Apps Script Web App 取代 app.js 內的 mock data
2. 串接 Google Sheet：STORY_POOL / VIDEO_FACTORY / PUBLISH_FACTORY
3. 串接 Gemini API
4. 將 toolCode 改由 TOOL_MAP 表帶入

## 建議 Apps Script API
- GET /stories
- POST /generate-content
- GET /video-factory
- POST /generate-publish
- GET /publish-factory
