import type { ScrollView, TextInput, View } from 'react-native';

export function revealFormField(
  input: Pick<TextInput, 'measureLayout'> | undefined,
  content: View | null,
  scroll: Pick<ScrollView, 'scrollTo'> | null,
  isCurrent: () => boolean,
): void {
  if (!input || !content || !scroll) return;

  input.measureLayout(content, (_x, y) => {
    if (!isCurrent() || !Number.isFinite(y)) return;
    scroll.scrollTo({ animated: true, y: Math.max(0, y - 24) });
  }, () => undefined);
}
