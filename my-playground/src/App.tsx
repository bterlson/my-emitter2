import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import { StyledPlayground } from "@cadl-lang/playground/src/components/playground.js";
import { BrowserHost, createBrowserHost } from '@cadl-lang/playground/src/browser-host.js';
import { attachServices } from "@cadl-lang/playground/src/services.js";
//import { createBrowserHost } from '../../playground/src/browser-host.js';
import './App.css'
import { EmitterTabs } from "./components/emitter-tabs.js";

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
      <div className='emitters' >
        <EmitterTabs />
      </div>
      <div className="playground">
        <StyledPlayground host={host}></StyledPlayground>
      </div>
    </div>
  )
}

export default App
