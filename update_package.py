import json

with open("package.json", "r") as f:
    config = json.load(f)

if "scripts" in config and "build" in config["scripts"]:
    # if it doesn't already have the cp command
    if "cp dist/index.html dist/404.html" not in config["scripts"]["build"]:
        config["scripts"]["build"] = config["scripts"]["build"] + " && cp dist/index.html dist/404.html"

with open("package.json", "w") as f:
    json.dump(config, f, indent=2)

