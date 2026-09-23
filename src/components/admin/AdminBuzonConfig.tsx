import React, { useState } from "react";
import { Save, AlertCircle, MessageSquare } from "lucide-react";
import { DEFAULT_BUZON_TEXTS, BuzonPopupText } from "../../constants/buzonTexts";

export const AdminBuzonConfig: React.FC = () => {
  const [texts, setTexts] = useState<Record<string, BuzonPopupText>>(DEFAULT_BUZON_TEXTS);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (key: string, field: keyof BuzonPopupText, value: string) => {
    setTexts(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save, since rule says we should not persist these dynamically in DB
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  const popups = [
    { key: "hiringRequest", label: "Contratación de Servicio" },
    { key: "modificationRequest", label: "Modificación de Propuesta" },
    { key: "acceptService", label: "Aceptación de Servicio" }
  ];

  return (
    <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-[0_12px_32px_-4px_rgba(44,47,48,0.06)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight text-primary flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            Configuración de Buzón
          </h2>
          <p className="text-sm font-medium text-on-surface-variant mt-1">
            Diseña y modifica los textos de las ventanas emergentes del flujo de contratación.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 mb-8">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-on-surface-variant">
          Nota: Según las políticas del sistema, los textos del área de administración se gestionan de forma nativa. Las modificaciones realizadas aquí son para previsualización o cambios locales temporales.
        </p>
      </div>

      <div className="space-y-8">
        {popups.map(({ key, label }) => {
          const popup = texts[key];
          return (
            <div key={key} className="bg-surface-container p-6 rounded-2xl border border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface mb-4">{label}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">
                    Título de la ventana
                  </label>
                  <input
                    type="text"
                    value={popup.title}
                    onChange={(e) => handleChange(key, "title", e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">
                    Descripción / Mensaje principal
                  </label>
                  <textarea
                    value={popup.description}
                    onChange={(e) => handleChange(key, "description", e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">
                      Texto Botón Confirmar
                    </label>
                    <input
                      type="text"
                      value={popup.confirmButtonText}
                      onChange={(e) => handleChange(key, "confirmButtonText", e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-1">
                      Texto Botón Cancelar
                    </label>
                    <input
                      type="text"
                      value={popup.cancelButtonText}
                      onChange={(e) => handleChange(key, "cancelButtonText", e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-success text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-5 h-5" />
          Cambios simulados guardados
        </div>
      )}
    </div>
  );
};
