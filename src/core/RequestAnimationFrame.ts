export const RequestAnimationFrame = {
  current: (cb: any) => global.requestAnimationFrame(cb),
  inject(injected: any) {
    RequestAnimationFrame.current = injected;
  },
};

export const CancelAnimationFrame = {
  current: (id: any) => global.cancelAnimationFrame(id),
  inject(injected: any) {
    CancelAnimationFrame.current = injected;
  },
};
