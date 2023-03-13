import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import { StyledPlayground } from "@cadl-lang/playground/src/components/playground.js";
import { BrowserHost, createBrowserHost } from '@cadl-lang/playground/src/browser-host.js';
import { attachServices } from "@cadl-lang/playground/src/services.js";
//import { createBrowserHost } from '../../playground/src/browser-host.js';
import './App.css'

(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

const host = await createBrowserHost();
await attachServices(host);

function App() {
  
  return (
    <div className="App">
      <StyledPlayground host={host}></StyledPlayground>
    </div>
  )
}

export default App
