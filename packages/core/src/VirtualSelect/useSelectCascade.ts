import { useCallback, useState } from 'react';
import type { CascadeConfig, SubMenuState } from './types';

export interface UseSelectCascadeReturn<TOption> {
  subMenus: SubMenuState<TOption>[];
  setSubMenus: React.Dispatch<React.SetStateAction<SubMenuState<TOption>[]>>;
  openSubMenu: (option: TOption) => void;
  closeSubMenus: () => void;
}

export function useSelectCascade<TOption>(
  cascadeConfig: CascadeConfig<TOption> | undefined,
  getOptionValue: (option: TOption) => string,
  optionsByValueRef: React.RefObject<Map<string, TOption>>
): UseSelectCascadeReturn<TOption> {
  const [subMenus, setSubMenus] = useState<SubMenuState<TOption>[]>([]);

  const openSubMenu = useCallback(
    (option: TOption) => {
      if (!cascadeConfig) return;

      const parentValue = getOptionValue(option);

      // Check if already open for this option
      if (subMenus.some((sm) => sm.parentValue === parentValue)) return;

      // Determine the real depth: if the parent option lives inside an
      // existing sub-menu at depth D, the new sub-menu is at D+1.
      // If the parent is a root-level option, the new sub-menu is at depth 0.
      let newDepth = 0;
      for (const sm of subMenus) {
        if (sm.options.some((o) => getOptionValue(o) === parentValue)) {
          newDepth = sm.depth + 1;
          break;
        }
      }

      const result = cascadeConfig.getChildren(option);

      if (result === null) return;

      if (result instanceof Promise) {
        // Add a loading sub-menu, trimming any at the same depth or deeper
        setSubMenus((prev) => [
          ...prev.filter((sm) => sm.depth < newDepth),
          {
            parentOption: option,
            parentValue,
            options: [],
            depth: newDepth,
            isLoading: true,
            focusedIndex: -1,
          },
        ]);

        result.then((children) => {
          // Index children
          for (const child of children) {
            optionsByValueRef.current!.set(getOptionValue(child), child);
          }
          setSubMenus((prev) =>
            prev.map((sm) =>
              sm.parentValue === parentValue ? { ...sm, options: children, isLoading: false } : sm
            )
          );
        });
      } else {
        // Sync children — trim any at the same depth or deeper, then append
        for (const child of result) {
          optionsByValueRef.current!.set(getOptionValue(child), child);
        }
        setSubMenus((prev) => [
          ...prev.filter((sm) => sm.depth < newDepth),
          {
            parentOption: option,
            parentValue,
            options: result,
            depth: newDepth,
            isLoading: false,
            focusedIndex: -1,
          },
        ]);
      }
    },
    [cascadeConfig, getOptionValue, subMenus, optionsByValueRef]
  );

  const closeSubMenus = useCallback(() => {
    setSubMenus([]);
  }, []);

  return { subMenus, setSubMenus, openSubMenu, closeSubMenus };
}
