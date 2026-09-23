cat src/App.tsx | sed 's/import { doc, getDoc }/import { doc, getDoc, getDocFromCache }/' > src/App_temp.tsx
mv src/App_temp.tsx src/App.tsx
