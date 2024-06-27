export const RequestAnimationFrame = {
  current: (cb: any) => window.requestAnimationFrame(cb),
  inject(injected: any) {
    RequestAnimationFrame.current = injected;
  },
};

export const CancelAnimationFrame = {
  current: (id: any) => window.cancelAnimationFrame(id),
  inject(injected: any) {
    CancelAnimationFrame.current = injected;
  },
};
