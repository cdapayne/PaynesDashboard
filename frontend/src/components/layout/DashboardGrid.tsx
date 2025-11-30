'use client';

import React, { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
  AnalyticsWidget, 
  SocialWidget, 
  AffiliateWidget, 
  RSSWidget, 
  AIWidget 
} from '../widgets';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: 'analytics', x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'social', x: 4, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'affiliate', x: 8, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    { i: 'rss', x: 0, y: 3, w: 6, h: 4, minW: 3, minH: 2 },
    { i: 'ai', x: 6, y: 3, w: 6, h: 4, minW: 3, minH: 2 },
  ],
  md: [
    { i: 'analytics', x: 0, y: 0, w: 5, h: 3, minW: 2, minH: 2 },
    { i: 'social', x: 5, y: 0, w: 5, h: 3, minW: 2, minH: 2 },
    { i: 'affiliate', x: 0, y: 3, w: 5, h: 3, minW: 2, minH: 2 },
    { i: 'rss', x: 5, y: 3, w: 5, h: 4, minW: 3, minH: 2 },
    { i: 'ai', x: 0, y: 6, w: 10, h: 4, minW: 3, minH: 2 },
  ],
  sm: [
    { i: 'analytics', x: 0, y: 0, w: 6, h: 3, minW: 2, minH: 2 },
    { i: 'social', x: 0, y: 3, w: 6, h: 3, minW: 2, minH: 2 },
    { i: 'affiliate', x: 0, y: 6, w: 6, h: 3, minW: 2, minH: 2 },
    { i: 'rss', x: 0, y: 9, w: 6, h: 4, minW: 3, minH: 2 },
    { i: 'ai', x: 0, y: 13, w: 6, h: 4, minW: 3, minH: 2 },
  ],
};

const widgetComponents: Record<string, React.ReactNode> = {
  analytics: <AnalyticsWidget />,
  social: <SocialWidget />,
  affiliate: <AffiliateWidget />,
  rss: <RSSWidget />,
  ai: <AIWidget />,
};

export function DashboardGrid() {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

  const onLayoutChange = useCallback((_currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    // In Phase 2, save to backend when user is authenticated
    // api.updateLayout(token, currentLayout);
  }, []);

  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={80}
        onLayoutChange={onLayoutChange}
        draggableHandle=".widget-drag-handle"
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        margin={[16, 16]}
      >
        {Object.entries(widgetComponents).map(([key, component]) => (
          <div key={key} className="widget-container">
            <div className="widget-drag-handle absolute top-0 left-0 right-0 h-12 cursor-move z-10" />
            {component}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
