import { Playground } from "@cadl-lang/playground/src/components/playground.js";
import { BrowserHost, createBrowserHost } from '@cadl-lang/playground/src/browser-host.js';
//import { createBrowserHost } from '../../playground/src/browser-host.js';
import './App.css'

const host = await createBrowserHost();
  
function App() {
  
  return (
    <div className="App">
      <Playground host={host}></Playground>
    </div>
  )
}

export default App
