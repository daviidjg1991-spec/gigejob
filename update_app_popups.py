import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update state
old_state = """  const [popupsConfig, setPopupsConfig] = useState<Record<string, any>>({});
  const [editingPopupAudience, setEditingPopupAudience] = useState<"all" | "guests" | "first_login">("all");

  const popupConfig = popupsConfig[editingPopupAudience] || {
    active: false,
    imageUrl: "",
    backgroundType: "image",
    backgroundColor: "#ffffff",
    triggerType: "delay",
    triggerScrollPercentage: 50,
    targetAudience: editingPopupAudience,
    redirectGuestsToRegister: false,
    delaySeconds: 1.5,
    backgroundImageUrl: "",
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    buttonRedirectToRegister: false,
    showEmailInput: false,
  };

  const setPopupConfig = (newConfig: any) => {
    setPopupsConfig(prev => ({
      ...prev,
      [editingPopupAudience]: { ...newConfig, targetAudience: editingPopupAudience }
    }));
  };"""

new_state = """  const [popupsConfig, setPopupsConfig] = useState<Record<string, any>>({});
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);

  const defaultPopupConfig = {
    active: false,
    imageUrl: "",
    backgroundType: "image",
    backgroundColor: "#ffffff",
    triggerType: "delay",
    triggerScrollPercentage: 50,
    targetAudience: "all",
    showInWeb: true,
    showInApp: true,
    redirectGuestsToRegister: false,
    delaySeconds: 1.5,
    backgroundImageUrl: "",
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    buttonRedirectToRegister: false,
    showEmailInput: false,
  };

  const popupConfig = editingPopupId ? (popupsConfig[editingPopupId] || defaultPopupConfig) : defaultPopupConfig;

  const setPopupConfig = (newConfig: any) => {
    if (editingPopupId) {
      setPopupsConfig(prev => ({
        ...prev,
        [editingPopupId]: { ...newConfig, id: editingPopupId }
      }));
    }
  };"""

content = content.replace(old_state, new_state)

# 2. Update Firestore listener
old_listener = """    const unsubPopups = onSnapshot(doc(db, "settings", "popups"), (docSnap) => {
      if (docSnap.exists()) {
        setPopupsConfig(docSnap.data());
      } else {
        getDocFromServer(doc(db, "settings", "popup")).then(oldSnap => {
          if (oldSnap.exists()) {
            const data = oldSnap.data();
            setPopupsConfig({ [data.targetAudience || "all"]: data });
          }
        });
      }
    });"""

new_listener = """    const unsubPopups = onSnapshot(doc(db, "settings", "popups"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const migratedData = Object.keys(data).reduce((acc: any, key) => {
          acc[key] = {
            showInWeb: true,
            showInApp: true,
            id: key,
            ...data[key]
          };
          return acc;
        }, {});
        setPopupsConfig(migratedData);
      } else {
        getDocFromServer(doc(db, "settings", "popup")).then(oldSnap => {
          if (oldSnap.exists()) {
            const data = oldSnap.data();
            setPopupsConfig({ [data.targetAudience || "all"]: {
              showInWeb: true, showInApp: true, id: data.targetAudience || "all", ...data
            } });
          }
        });
      }
    });"""

content = content.replace(old_listener, new_listener)

# 3. Update Admin UI form to use editingPopupId
old_ui_start = """            {popupSubTab === "design" ? (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6 w-full lg:max-w-md">"""

new_ui_start = """            {popupSubTab === "design" ? (
              !editingPopupId ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black font-display tracking-tight text-primary">
                        Pop-ups Configurados
                      </h2>
                      <p className="text-sm text-on-surface-variant font-medium mt-1">
                        Gestiona los pop-ups que se muestran en la web y app.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newId = Date.now().toString();
                        setPopupsConfig(prev => ({ ...prev, [newId]: { ...defaultPopupConfig, id: newId } }));
                        setEditingPopupId(newId);
                      }}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      Crear Nuevo Pop-up
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {Object.values(popupsConfig).map((p: any) => (
                      <div key={p.id} className="bg-surface-container flex items-center justify-between p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/50 transition-colors">
                        <div>
                          <h3 className="font-bold text-lg">{p.title || "Pop-up sin título"}</h3>
                          <div className="flex gap-2 mt-2 text-sm text-on-surface-variant">
                            <span className="bg-surface p-1 px-2 rounded-lg border border-outline-variant/20">
                              Audiencia: {p.targetAudience === "all" ? "Todos" : p.targetAudience === "guests" ? "No registrados" : "Primer login"}
                            </span>
                            {p.showInWeb && <span className="bg-blue-500/10 text-blue-500 font-bold p-1 px-2 rounded-lg">Web</span>}
                            {p.showInApp && <span className="bg-green-500/10 text-green-500 font-bold p-1 px-2 rounded-lg">App</span>}
                            {!p.active && <span className="bg-red-500/10 text-red-500 font-bold p-1 px-2 rounded-lg">Inactivo</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPopupId(p.id)}
                            className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("¿Eliminar este pop-up?")) {
                                const newConfig = { ...popupsConfig };
                                delete newConfig[p.id];
                                setPopupsConfig(newConfig);
                                await setDoc(doc(db, "settings", "popups"), newConfig);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {Object.keys(popupsConfig).length === 0 && (
                      <p className="text-center text-on-surface-variant p-8 bg-surface-container rounded-2xl border border-outline-variant/20 border-dashed">
                        No hay pop-ups configurados.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6 w-full lg:max-w-md">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setEditingPopupId(null)}
                      className="p-2 hover:bg-surface-container rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-black font-display tracking-tight text-primary">
                        Editar Pop-up
                      </h2>
                      <p className="text-sm text-on-surface-variant font-medium mt-1">
                        Configura el diseño y comportamiento de este pop-up.
                      </p>
                    </div>
                  </div>"""

content = content.replace(old_ui_start, new_ui_start)

# 4. Update the audience select and add Web/App checkboxes
old_audience = """                      <select
                        className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/20 font-medium"
                        value={editingPopupAudience}
                        onChange={(e) => setEditingPopupAudience(e.target.value as any)}
                      >"""

new_audience = """                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={popupConfig.showInWeb ?? true}
                            onChange={(e) => setPopupConfig({ ...popupConfig, showInWeb: e.target.checked })}
                            className="w-5 h-5 rounded text-primary"
                          />
                          <span className="font-bold">Mostrar en Web</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-colors">
                          <input
                            type="checkbox"
                            checked={popupConfig.showInApp ?? true}
                            onChange={(e) => setPopupConfig({ ...popupConfig, showInApp: e.target.checked })}
                            className="w-5 h-5 rounded text-primary"
                          />
                          <span className="font-bold">Mostrar en App</span>
                        </label>
                      </div>
                      <select
                        className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/20 font-medium"
                        value={popupConfig.targetAudience || "all"}
                        onChange={(e) => setPopupConfig({ ...popupConfig, targetAudience: e.target.value })}
                      >"""

content = content.replace(old_audience, new_audience)

# Also close the extra parenthesis at the end of the design tab
old_end_design = """                        <span className="font-black tracking-widest uppercase text-xs">
                          {isSavingPopup ? "Guardando..." : "Guardar Pop-up"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex-1 w-full sticky top-8 flex items-center justify-center p-8 bg-surface-container/50 rounded-3xl border border-outline-variant/20 min-h-[600px]">
                  <PopupPreview config={popupConfig} />
                </div>
              </div>
            ) : ("""

new_end_design = """                        <span className="font-black tracking-widest uppercase text-xs">
                          {isSavingPopup ? "Guardando..." : "Guardar Pop-up"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex-1 w-full sticky top-8 flex items-center justify-center p-8 bg-surface-container/50 rounded-3xl border border-outline-variant/20 min-h-[600px]">
                  <PopupPreview config={popupConfig} />
                </div>
              </div>
              )
            ) : ("""

content = content.replace(old_end_design, new_end_design)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
