declare global {
  interface Window {
    Telegram: {
      WebApp: {
        colorScheme: 'dark' | 'light';
        themeParams: any;
        requestTheme(params: any): void;
        onEvent(event: string, callback: (e: any) => void): void;
        offEvent(event: string, callback: (e: any) => void): void;
      };
    };
  }
}

export {};
