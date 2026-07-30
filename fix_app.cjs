const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [footerConfig, setFooterConfig] = useState<FooterConfig>(
    DEFAULT_FOOTER_CONFIG,
  );`;

const replacement = `  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
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
  }, []);`;

if (appTsx.includes(target)) {
  appTsx = appTsx.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', appTsx);
  console.log("Successfully fixed global footerConfig.");
} else {
  console.log("Target not found. Please check manually.");
}
