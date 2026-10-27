import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Banner } from '@/shared/ui/Banner';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { ChipGroup } from '@/shared/ui/ChipGroup';
import { TextField } from '@/shared/ui/TextField';
import { spacing, useThemedStyles } from '@/shared/ui/theme';

import { EMERGENCY_PHONE, type AlertParty } from '../model/alerts';

/** State of the send, the same names as a TanStack mutation. */
export type EmergencyStatus = 'idle' | 'pending' | 'error' | 'success';

type Props = {
  viewer: AlertParty;
  status: EmergencyStatus;
  onConfirm: (message: string | undefined) => void;
  /** Called when a new emergency starts, so a previous send does not show in the sheet. */
  onOpen?: () => void;
  /** "Escribir al dueño / al paseador" once the alert is sent. */
  onOpenChat?: () => void;
};

/** Quick kinds of emergency; the chosen one becomes the alert `message` (design proposal 07 · 21, no API change). */
const KINDS = [
  { value: 'Se soltó', label: 'Se soltó' },
  { value: 'Se lastimó', label: 'Se lastimó' },
  { value: 'Otro', label: 'Otro' },
] as const;
type Kind = (typeof KINDS)[number]['value'] | '';

/** Who is warned, from the point of view of whoever raises the alert. */
const COUNTERPART: Record<AlertParty, string> = { Owner: 'al paseador', Walker: 'al dueño' };

const FAILED_MESSAGE = `No pudimos enviar la alerta. Llama al ${EMERGENCY_PHONE} si es urgente.`;

/**
 * RF-012: red emergency button. It opens a bottom sheet that confirms first, so a pocket tap does not raise a false
 * alarm (design proposal 07 · 21): what happens, the kind of emergency and a short message. The sheet cannot be
 * dismissed while sending; once sent it says "Mantén la calma" and offers to call the public emergency line and to
 * write to the other person. A failed send keeps a "Reintentar" with the same message, also after closing the sheet.
 */
export function EmergencyButton({ viewer, status, onConfirm, onOpen, onOpenChat }: Props) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>('');
  const [message, setMessage] = useState('');
  const [callFailed, setCallFailed] = useState(false);
  const styles = useThemedStyles(() => ({ container: { gap: spacing.md }, actions: { gap: spacing.sm } }));
  const sending = status === 'pending';
  const failed = status === 'error';
  const sent = status === 'success';

  function start() {
    setKind('');
    setMessage('');
    setCallFailed(false);
    onOpen?.();
    setOpen(true);
  }

  function confirm() {
    const parts = [kind === 'Otro' ? '' : kind, message.trim()].filter((part) => part !== '');
    onConfirm(parts.length > 0 ? parts.join('. ') : undefined);
  }

  function retryFromScreen() {
    setOpen(true);
    confirm();
  }

  async function call() {
    try {
      await Linking.openURL(`tel:${EMERGENCY_PHONE}`);
      setCallFailed(false);
    } catch {
      setCallFailed(true);
    }
  }

  function writeToCounterpart() {
    setOpen(false);
    onOpenChat?.();
  }

  const callButton = (
    <Button
      label={`Llamar al ${EMERGENCY_PHONE}`}
      variant={sent ? 'danger' : 'secondary'}
      onPress={() => void call()}
    />
  );
  const callFailedBanner = callFailed && (
    <Banner tone="warning" message={`No pudimos abrir el teléfono. Marca ${EMERGENCY_PHONE} desde tu celular.`} />
  );

  return (
    <View style={styles.container}>
      {failed && !open && (
        <Banner tone="danger" message={FAILED_MESSAGE} actionLabel="Reintentar" onAction={retryFromScreen} />
      )}
      <Button label="Emergencia" variant="danger" onPress={start} />

      <BottomSheet
        visible={open}
        title={sent ? 'Mantén la calma' : '¿Es una emergencia?'}
        message={
          sent
            ? `Tu ubicación quedó registrada. Si alguien corre peligro, llama al ${EMERGENCY_PHONE}.`
            : `Avisaremos de inmediato ${COUNTERPART[viewer]} con tu ubicación actual.`
        }
        onClose={() => setOpen(false)}
        dismissible={!sending}
      >
        {sent ? (
          <View style={styles.actions}>
            {callFailedBanner}
            {callButton}
            {onOpenChat !== undefined && (
              <Button label={`Escribir ${COUNTERPART[viewer]}`} variant="secondary" onPress={writeToCounterpart} />
            )}
            <Button label="Listo" variant="tertiary" onPress={() => setOpen(false)} />
          </View>
        ) : (
          <>
            <ChipGroup<Kind> label="¿Qué pasa?" options={KINDS} value={kind} onChange={setKind} />
            <TextField
              label="Mensaje (opcional)"
              value={message}
              onChangeText={setMessage}
              maxLength={500}
              multiline
              editable={!sending}
            />
            {failed && <Banner tone="danger" message={FAILED_MESSAGE} />}
            {callFailedBanner}
            <View style={styles.actions}>
              <Button
                label={failed ? 'Reintentar' : 'Sí, es una emergencia'}
                loadingLabel="Enviando…"
                loading={sending}
                variant="danger"
                onPress={confirm}
              />
              {failed && callButton}
              <Button label="No, volver" variant="secondary" disabled={sending} onPress={() => setOpen(false)} />
            </View>
          </>
        )}
      </BottomSheet>
    </View>
  );
}
