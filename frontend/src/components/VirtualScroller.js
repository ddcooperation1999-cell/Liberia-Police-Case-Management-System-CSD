import React, { useState, useCallback, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Virtual Scroller Component
 * Renders only visible items in a list for better performance
 * Suitable for tables and lists with 1000+ items
 */
export const VirtualScroller = ({
  items = [],
  itemHeight = 50,
  containerHeight = 500,
  renderItem,
  loading = false,
  onLoadMore,
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = startIndex + visibleCount + 1;

    return {
      startIndex: Math.max(0, startIndex),
      endIndex: Math.min(items.length, endIndex),
      offsetY: startIndex * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);

    // Load more when scrolling near bottom
    if (
      onLoadMore &&
      newScrollTop + containerHeight >= items.length * itemHeight - 200
    ) {
      onLoadMore();
    }
  }, [items.length, itemHeight, containerHeight, onLoadMore]);

  const totalHeight = items.length * itemHeight;

  return (
    <Box
      sx={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid #ccc',
      }}
      onScroll={handleScroll}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            transform: `translateY(${visibleRange.offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <Box
              key={visibleRange.startIndex + index}
              sx={{ height: itemHeight, overflow: 'hidden' }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </Box>
          ))}
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default VirtualScroller;
