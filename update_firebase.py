import json

with open("firebase.json", "r") as f:
    config = json.load(f)

# Valid react routes derived from App.tsx
rewrites = [
    { "source": "/", "destination": "/index.html" },
    { "source": "/pagina/**", "destination": "/index.html" },
    { "source": "/blog", "destination": "/index.html" },
    { "source": "/blog/**", "destination": "/index.html" },
    { "source": "/explorar", "destination": "/index.html" },
    { "source": "/admin", "destination": "/index.html" },
    { "source": "/login", "destination": "/index.html" },
    { "source": "/registro", "destination": "/index.html" },
    { "source": "/mensajes", "destination": "/index.html" },
    { "source": "/mis-anuncios", "destination": "/index.html" },
    { "source": "/favoritos", "destination": "/index.html" },
    { "source": "/estadisticas", "destination": "/index.html" },
    { "source": "/monederos", "destination": "/index.html" },
    { "source": "/configuracion/**", "destination": "/index.html" },
    { "source": "/anuncio/**", "destination": "/index.html" },
    { "source": "/publicar", "destination": "/index.html" },
    { "source": "/perfil", "destination": "/index.html" },
    { "source": "/perfil/**", "destination": "/index.html" },
]

if "hosting" in config:
    config["hosting"]["rewrites"] = rewrites
    config["hosting"]["cleanUrls"] = True

with open("firebase.json", "w") as f:
    json.dump(config, f, indent=2)

