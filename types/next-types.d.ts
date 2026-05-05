declare module 'next/types.js' {
  // Next.js 16.2.4 types declaration
  export interface ResolvingMetadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
  
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
  
  export interface ResolvingViewport {
    themeColor?: string;
    width?: string;
    height?: string;
    [key: string]: any;
  }
  
  export interface Viewport {
    themeColor?: string;
    width?: string;
    height?: string;
    [key: string]: any;
  }
  
  // Export all Next.js types
  export * from 'next';
}
