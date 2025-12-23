/**
 * Form State Hook
 * Generic hook for managing form state with change tracking
 */

import { createSignal } from "solid-js";

export interface FormStateOptions<T> {
  initialValues: T;
  onSave: (values: T) => Promise<void>;
  onReset?: () => Promise<void>;
}

export interface FormState<T> {
  values: T;
  setValues: (values: Partial<T>) => void;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  hasChanges: () => boolean;
  isSaving: () => boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  syncWithInitial: (newInitial: T) => void;
}

/**
 * Custom hook for managing form state with change detection
 * Note: Due to SolidJS signal constraints, this is a simplified version
 */
export function useFormState<T extends Record<string, any>>(
  options: FormStateOptions<T>
): FormState<T> {
  const [values, setValuesSignal] = createSignal<T>({ ...options.initialValues });
  const [initialValues, setInitialValues] = createSignal<T>({ ...options.initialValues });
  const [isSaving, setIsSaving] = createSignal(false);

  const setValues = (newValues: Partial<T>) => {
    setValuesSignal((prev: T) => ({ ...prev, ...newValues }));
  };

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValuesSignal((prev: T) => ({ ...prev, [key]: value }));
  };

  const hasChanges = (): boolean => {
    const current = values();
    const initial = initialValues();
    
    return Object.keys(current).some(
      (key) => current[key] !== initial[key]
    );
  };

  const save = async () => {
    if (!hasChanges()) return;
    
    setIsSaving(true);
    try {
      await options.onSave(values());
      setInitialValues(() => ({ ...values() }));
    } finally {
      setIsSaving(false);
    }
  };

  const reset = async () => {
    if (options.onReset) {
      await options.onReset();
    }
    setValuesSignal(() => ({ ...options.initialValues }));
    setInitialValues(() => ({ ...options.initialValues }));
  };

  const syncWithInitial = (newInitial: T) => {
    setInitialValues(() => ({ ...newInitial }));
    setValuesSignal(() => ({ ...newInitial }));
  };

  return {
    values: values(),
    setValues,
    setValue,
    hasChanges,
    isSaving,
    save,
    reset,
    syncWithInitial,
  };
}
