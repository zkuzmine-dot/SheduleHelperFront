// "Кузьмин Евгений Вячеславович" -> "Кузьмин Е.В."
// Сохраняет хвост в скобках, если он есть: "Иванов Иван Иванович (староста)" -> "Иванов И.И. (староста)"
export function abbreviateName(fullName) {
  if (!fullName) return fullName;

  const match = fullName.match(/^(.+?)(\s*\([^)]*\))?$/);
  const namePart = (match?.[1] || fullName).trim();
  const suffix = match?.[2] || '';

  const parts = namePart.split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return fullName;

  const [last, first, middle] = parts;
  let abbreviated = `${last} ${first.charAt(0).toUpperCase()}.`;
  if (middle) abbreviated += `${middle.charAt(0).toUpperCase()}.`;

  return `${abbreviated}${suffix}`;
}
