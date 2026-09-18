import { useCallback, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';
import type { ScrollView, TextInput, View } from 'react-native';
import { firstInvalidField } from './form-policy';
import { revealFormField } from './keyboard-form-scroll';

export function useKeyboardForm<Field extends string>() {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const fields = useRef(new Map<Field, TextInput>());
  const focusedField = useRef<Field | null>(null);
  const revealGeneration = useRef(0);
  const register = useCallback((field: Field) => (input: TextInput | null) => {
    if (input) fields.current.set(field, input); else fields.current.delete(field);
  }, []);
  const reveal = useCallback((field: Field) => {
    focusedField.current = field;
    const input = fields.current.get(field);
    const content = contentRef.current;
    const scroll = scrollRef.current;
    const generation = ++revealGeneration.current;
    revealFormField(input, content, scroll, () =>
      generation === revealGeneration.current && fields.current.get(field) === input &&
      contentRef.current === content && scrollRef.current === scroll,
    );
  }, []);
  const onViewportLayout = useCallback(() => {
    const field = focusedField.current;
    if (field !== null && fields.current.get(field)?.isFocused()) reveal(field);
  }, [reveal]);
  useEffect(() => {
    let frame: number | undefined;
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(onViewportLayout);
    });
    return () => {
      subscription.remove();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [onViewportLayout]);
  const focusFirstError = useCallback((errors: Partial<Record<Field, unknown>>, order: readonly Field[]) => {
    const first = firstInvalidField(errors, order);
    if (!first) return;
    requestAnimationFrame(() => { fields.current.get(first)?.focus(); reveal(first); });
  }, [reveal]);
  return { contentRef, focusFirstError, onFocus: reveal, onViewportLayout, register, scrollRef };
}
