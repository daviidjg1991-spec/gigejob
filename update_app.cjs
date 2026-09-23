const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Footer Config
appTsx = appTsx.replace(
  `  const [footerConfig, setFooterConfig] = useState<FooterConfig>(
    DEFAULT_FOOTER_CONFIG,
  );`,
  `  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
    try {
      const cached = localStorage.getItem("app_footerConfig");
      return cached ? JSON.parse(cached) : DEFAULT_FOOTER_CONFIG;
    } catch {
      return DEFAULT_FOOTER_CONFIG;
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "footer"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().columns) {
        const config = docSnap.data() as FooterConfig;
        setFooterConfig(config);
        localStorage.setItem("app_footerConfig", JSON.stringify(config));
      }
    });
    return () => unsub();
  }, []);`
);

// 2. Pro Plans Config
appTsx = appTsx.replace(
  `  const [plans, setPlans] = useState<any[]>(PRO_PLANS);`,
  `  const [plans, setPlans] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("app_pro_plans");
      return cached ? JSON.parse(cached) : PRO_PLANS;
    } catch {
      return PRO_PLANS;
    }
  });`
);

appTsx = appTsx.replace(
  `        if (data.plans) setPlans(data.plans);`,
  `        if (data.plans) {
          setPlans(data.plans);
          localStorage.setItem("app_pro_plans", JSON.stringify(data.plans));
        }`
);

// 3. Search Professionals
appTsx = appTsx.replace(
  `  const [isSearchProfessionalsEnabled, setIsSearchProfessionalsEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    getDoc(doc(db, "settings", "services")).then((snap) => {
      if (snap.exists() && snap.data().enableSearchProfessionals !== undefined) {
        setIsSearchProfessionalsEnabled(snap.data().enableSearchProfessionals);
      }
    });
  }, []);`,
  `  const [isSearchProfessionalsEnabled, setIsSearchProfessionalsEnabled] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("app_search_enabled");
      return cached ? JSON.parse(cached) : ENABLE_SEARCH_PROFESSIONALS;
    } catch {
      return ENABLE_SEARCH_PROFESSIONALS;
    }
  });
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "services"), (snap) => {
      if (snap.exists() && snap.data().enableSearchProfessionals !== undefined) {
        const val = snap.data().enableSearchProfessionals;
        setIsSearchProfessionalsEnabled(val);
        localStorage.setItem("app_search_enabled", JSON.stringify(val));
      }
    });
    return () => unsub();
  }, []);`
);

// 4. Popups Config
appTsx = appTsx.replace(
  `  const [globalPopupsConfig, setGlobalPopupsConfig] = useState<Record<string, any>>({});`,
  `  const [globalPopupsConfig, setGlobalPopupsConfig] = useState<Record<string, any>>(() => {
    try {
      const cached = localStorage.getItem("app_popups");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });`
);

appTsx = appTsx.replace(
  `    const unsub = onSnapshot(doc(db, "settings", "popups"), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalPopupsConfig(docSnap.data());
      } else {
        getDocFromServer(doc(db, "settings", "popup")).then((oldSnap) => {
          if (oldSnap.exists()) {
            const data = oldSnap.data();
            setGlobalPopupsConfig({ [data.targetAudience || "all"]: data });
          } else {
            setIsPopupOpen(false);
          }
        });
      }
    });`,
  `    const unsub = onSnapshot(doc(db, "settings", "popups"), (docSnap) => {
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
    });`
);


fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx updated');
