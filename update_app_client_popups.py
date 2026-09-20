import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_getActive = """  const getActivePopupConfig = () => {
    if (!globalPopupsConfig) return null;
    
    if (user && sessionStorage.getItem("is_first_login_session") === "true") {
      if (globalPopupsConfig.first_login?.active) return globalPopupsConfig.first_login;
    }
    if (!user) {
      if (globalPopupsConfig.guests?.active) return globalPopupsConfig.guests;
    }
    if (globalPopupsConfig.all?.active) return globalPopupsConfig.all;
    
    return null;
  };"""

new_getActive = """  const getActivePopupConfig = () => {
    if (!globalPopupsConfig) return null;
    
    // Convert to array of active popups
    const popups = Object.values(globalPopupsConfig).filter((p: any) => p && p.active);
    if (popups.length === 0) return null;

    const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    
    // Filter by platform
    const platformPopups = popups.filter((p: any) => {
      if (isNative && p.showInApp) return true;
      if (!isNative && p.showInWeb) return true;
      // Default to true if not specified to maintain backwards compatibility
      if (p.showInApp === undefined && p.showInWeb === undefined) return true;
      return false;
    });

    if (platformPopups.length === 0) return null;

    // Filter by audience
    if (user && sessionStorage.getItem("is_first_login_session") === "true") {
      const firstLogin = platformPopups.find((p: any) => p.targetAudience === "first_login");
      if (firstLogin) return firstLogin;
    }
    if (!user) {
      const guests = platformPopups.find((p: any) => p.targetAudience === "guests");
      if (guests) return guests;
    }
    
    const all = platformPopups.find((p: any) => p.targetAudience === "all" || !p.targetAudience);
    if (all) return all;
    
    return platformPopups[0];
  };"""

content = content.replace(old_getActive, new_getActive)

# Fix the fallback migration in the client listener as well
old_listener = """    const unsub = onSnapshot(doc(db, "settings", "popups"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalPopupsConfig(data);
        localStorage.setItem("app_popups", JSON.stringify(data));
      } else {
        getDocFromServer(doc(db, "settings", "popup")).then((oldSnap) => {
          if (oldSnap.exists()) {
            const data = oldSnap.data();
            const newData = { [data.targetAudience || "all"]: data };
            setGlobalPopupsConfig(newData);
            localStorage.setItem("app_popups", JSON.stringify(newData));
          } else {
            setIsPopupOpen(false);
          }
        });
      }
    });"""

new_listener = """    const unsub = onSnapshot(doc(db, "settings", "popups"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalPopupsConfig(data);
        localStorage.setItem("app_popups", JSON.stringify(data));
      } else {
        getDocFromServer(doc(db, "settings", "popup")).then((oldSnap) => {
          if (oldSnap.exists()) {
            const data = oldSnap.data();
            const newData = { [data.targetAudience || "all"]: { id: data.targetAudience || "all", showInWeb: true, showInApp: true, ...data } };
            setGlobalPopupsConfig(newData);
            localStorage.setItem("app_popups", JSON.stringify(newData));
          } else {
            setIsPopupOpen(false);
          }
        });
      }
    });"""

content = content.replace(old_listener, new_listener)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
