import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./components/Home";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sender" element={<Sender />} />
          <Route path="/receiver" element={<Receiver />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;