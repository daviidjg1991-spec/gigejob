export interface BuzonPopupText {
  id: string;
  title: string;
  description: string;
  confirmButtonText: string;
  cancelButtonText: string;
}

export const DEFAULT_BUZON_TEXTS: Record<string, BuzonPopupText> = {
  hiringRequest: {
    id: "hiringRequest",
    title: "Solicitud de Contratación",
    description: "Estás a punto de enviar una solicitud para contratar este servicio. El profesional recibirá una notificación.",
    confirmButtonText: "Enviar Solicitud",
    cancelButtonText: "Cancelar"
  },
  modificationRequest: {
    id: "modificationRequest",
    title: "Modificar Propuesta",
    description: "Puedes ajustar los detalles de la propuesta antes de aceptarla. El profesional deberá revisar los cambios.",
    confirmButtonText: "Enviar Cambios",
    cancelButtonText: "Volver"
  },
  acceptService: {
    id: "acceptService",
    title: "Aceptar Servicio",
    description: "¿Confirmas que deseas aceptar la propuesta actual? Al aceptar, el acuerdo será vinculante.",
    confirmButtonText: "Aceptar y Continuar",
    cancelButtonText: "Cancelar"
  }
};
