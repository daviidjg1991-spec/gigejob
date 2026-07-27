import re

with open("src/App.tsx", "r") as f:
    content = f.read()

not_found_component = """
const NotFoundPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg w-full"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Search className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-black text-on-surface mb-4">404</h1>
        <h2 className="text-2xl font-bold text-on-surface mb-4">Página no encontrada</h2>
        <p className="text-on-surface-variant mb-8">
          Lo sentimos, no pudimos encontrar la página que estás buscando. 
          Quizás fue eliminada, cambió de nombre o está temporalmente inaccesible.
        </p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar anuncios, servicios, profesionales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border-2 border-outline-variant focus:border-primary focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Buscar
            </button>
          </div>
        </form>

        <button
          onClick={() => navigate("/")}
          className="px-8 py-4 bg-surface-container border-2 border-outline-variant rounded-2xl font-black uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-all"
        >
          Volver al inicio
        </button>
      </motion.div>
    </div>
  );
};
"""

# Insert the component before Root component
root_idx = content.find("export default function Root()")
if root_idx != -1:
    content = content[:root_idx] + not_found_component + "\n" + content[root_idx:]

# Replace the catch-all route
content = content.replace(
    '<Route path="*" element={<Navigate to="/" replace />} />',
    '<Route path="*" element={<NotFoundPage />} />'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
