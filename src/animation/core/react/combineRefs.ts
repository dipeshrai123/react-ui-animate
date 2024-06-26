// Combine multiple refs
export function combineRefs(
  ...refs: Array<React.RefObject<any> | ((element: HTMLElement) => void)>
) {
  return function applyRef(element: HTMLElement) {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === "function") {
        ref(element);
        return;
      }

      if ("current" in ref) {
        // @ts-ignore
        ref.current = element;
      }
    });
  };
}
