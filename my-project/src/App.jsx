import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Overview from "./pages/Overview";
import RiskAtlas from "./pages/RiskAtlas";
import ZoneHub from "./pages/ZoneHub";
import Alerts from "./pages/Alerts";
import SimulationLab from "./pages/SimulationLab";
import Leaderboard from "./pages/Leaderboard";
import ModelLab from "./pages/ModelLab";
import InsightStream from "./pages/InsightStream";
import SystemMonitor from "./pages/SystemMonitor";
import ManualPredict from "./pages/ManualPredict";
import AutoSimulation from "./pages/AutoSimulation";
import DelhiLanding from "./pages/DelhiLanding";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/delhi" replace />} />
          <Route path="/delhi" element={<DelhiLanding />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/map" element={<RiskAtlas />} />
          <Route path="/zones" element={<ZoneHub />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/simulation" element={<SimulationLab />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/model-lab" element={<ModelLab />} />
          <Route path="/insights" element={<InsightStream />} />
          <Route path="/system" element={<SystemMonitor />} />
          <Route path="/predict" element={<ManualPredict />} />
          <Route path="/auto-simulate" element={<AutoSimulation />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;