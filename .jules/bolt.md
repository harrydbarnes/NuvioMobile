## 2024-04-12 - Missing FlatList Optimizations in Lists
**Learning:** Certain FlatList components handling complex interactive cards (like the ContinueWatchingSection) were missing essential virtualization props (`initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `updateCellsBatchingPeriod`). Without these, large watch histories will try to render all off-screen items synchronously, causing massive UI thread blocking and memory bloat on startup or refresh.
**Action:** Always verify `FlatList` implementations, especially those displaying media content or progress cards, include dynamic virtualization props suited for the target platform (TV vs Tablet vs Phone) to balance fast initial render and smooth scrolling.
## 2024-05-24 - Search Optimization
**Learning:** The live search input had a very long 800ms debounce which made the app feel unresponsive.
**Action:** Always check the debounce timing on live search inputs. Industry standard is usually around 300ms to balance API calls and user responsiveness.
## 2026-04-13 - Extract inline render functions to prevent re-renders
**Learning:** Extracting inline render functions (e.g., renderItem inside FlashList) into separate React.memo components prevents unnecessary re-renders in large list views.
**Action:** Always extract inline renderItem functions in large screens (like LibraryScreen) into their own memoized components, passing necessary dependencies (like styles or navigation) as props.
