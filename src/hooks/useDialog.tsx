import { useState, useCallback } from 'react';
import { DialogType } from '../components/common/Dialog';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface DialogState {
  visible: boolean;
  title: string;
  message: string;
  type: DialogType;
  buttons: DialogButton[];
}

export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showDialog = useCallback(
    (
      title: string,
      message: string,
      buttons: DialogButton[],
      type: DialogType = 'info'
    ) => {
      setDialog({
        visible: true,
        title,
        message,
        type,
        buttons,
      });
    },
    []
  );

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  // Helper para confirmaciones simples
  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      type: DialogType = 'warning'
    ) => {
      showDialog(
        title,
        message,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: hideDialog,
          },
          {
            text: 'Confirmar',
            style: type === 'error' ? 'destructive' : 'default',
            onPress: () => {
              onConfirm();
              hideDialog();
            },
          },
        ],
        type
      );
    },
    [showDialog, hideDialog]
  );

  return {
    dialog,
    showDialog,
    hideDialog,
    confirm,
  };
};
