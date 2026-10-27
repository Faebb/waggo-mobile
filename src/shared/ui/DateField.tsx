import { TextField } from './TextField';

/**
 * "10052021" → "10/05/2021" as the user types: keeps only digits (at most 8) and adds the slashes, so a number pad
 * is enough on every platform.
 */
export function formatDateText(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** "10/05/2021" (day/month/year) → "2021-05-10", the API's `DateOnly`; `null` when it is not a real date. */
export function parseDateText(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (match === null) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** "2021-05-10" (`DateOnly`) → "10/05/2021", the same format the field uses. */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  editable?: boolean;
  /** Prefixes the hint with "Opcional." like the other optional fields. */
  optional?: boolean;
};

/**
 * Date typed as day/month/year. A stand-in for the native date picker of the design (proposal 07 · 9): that needs a
 * new dependency (`@react-native-community/datetimepicker`), which is a PO decision. Validate with `parseDateText`.
 */
export function DateField({ label, value, onChangeText, error, editable, optional = false }: Props) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={(text) => onChangeText(formatDateText(text))}
      error={error}
      hint={`${optional ? 'Opcional. ' : ''}Día/mes/año, por ejemplo 10/05/2021.`}
      placeholder="DD/MM/AAAA"
      keyboardType="number-pad"
      maxLength={10}
      editable={editable}
    />
  );
}
