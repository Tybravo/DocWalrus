interface Window {
  particlesJS: (id: string, config: any) => void;
  pJSDom: Array<{
    pJS: {
      fn: {
        vendors: {
          destroypJS: () => void;
        };
      };
    };
  }>;
}