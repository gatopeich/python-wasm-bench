let pyodide_pkg = await import("pyodide/pyodide.js");

let pyodide = await pyodide_pkg.loadPyodide();

await pyodide.runPythonAsync("1+1");
