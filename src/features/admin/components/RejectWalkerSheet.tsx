import { useState } from 'react';

import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/Button';
import { TextField } from '@/shared/ui/TextField';

type Props = {
  /** The walker being rejected; `null` keeps the sheet closed. */
  fullName: string | null;
  rejecting: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/** "Rechazar a …" sheet: the optional reason the walker will read on their verification screen (RF-003; PO: optional). */
export function RejectWalkerSheet({ fullName, rejecting, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState('');
  const firstName = fullName?.split(' ')[0] ?? '';

  function close() {
    setReason('');
    onCancel();
  }

  return (
    <BottomSheet
      visible={fullName !== null}
      title={`Rechazar a ${fullName ?? ''}`}
      message={`Si escribes un motivo, ${firstName} lo verá en su pantalla de verificación.`}
      dismissible={!rejecting}
      onClose={close}
    >
      <TextField
        label="Motivo del rechazo (opcional)"
        value={reason}
        onChangeText={setReason}
        multiline
        maxLength={300}
      />
      <Button
        label="Confirmar rechazo"
        loading={rejecting}
        loadingLabel="Rechazando…"
        onPress={() => onConfirm(reason.trim())}
      />
      <Button label="Cancelar" variant="secondary" onPress={close} disabled={rejecting} />
    </BottomSheet>
  );
}
