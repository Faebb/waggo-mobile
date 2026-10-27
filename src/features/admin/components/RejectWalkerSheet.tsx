import { useState } from 'react';

import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';

/** ⚠️ provisional (design proposal 07 · 35): the API only requires a reason; the 5-character floor is front-end. */
export const MIN_REJECTION_REASON_LENGTH = 5;

type Props = {
  /** The walker being rejected; `null` keeps the sheet closed. */
  fullName: string | null;
  rejecting: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/** "Rechazar a …" sheet: the reason the walker will read on their verification screen (RF-003). */
export function RejectWalkerSheet({ fullName, rejecting, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('');
  const firstName = fullName?.split(' ')[0] ?? '';
  const tooShort = reason.trim().length < MIN_REJECTION_REASON_LENGTH;

  function close() {
    setReason('');
    onCancel();
  }

  return (
    <BottomSheet
      visible={fullName !== null}
      title={`Rechazar a ${fullName ?? ''}`}
      message={`Escribe el motivo. ${firstName} lo verá en su pantalla de verificación.`}
      dismissible={!rejecting}
      onClose={close}
    >
      <TextField
        label="Motivo del rechazo"
        value={reason}
        onChangeText={setReason}
        hint={tooShort ? `Escribe al menos ${MIN_REJECTION_REASON_LENGTH} caracteres.` : undefined}
        multiline
        maxLength={300}
      />
      <Button
        label="Confirmar rechazo"
        loading={rejecting}
        loadingLabel="Rechazando…"
        disabled={tooShort}
        onPress={() => onConfirm(reason.trim())}
      />
      <Button label="Cancelar" variant="secondary" onPress={close} disabled={rejecting} />
    </BottomSheet>
  );
}
