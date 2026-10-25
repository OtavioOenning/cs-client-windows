import { useState } from "react";
import { TitleBar } from "./components/TitleBar";
import { Sidebar, Route } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { FpsPlus } from "./pages/FpsPlus";
import { ProConfig } from "./pages/ProConfig";
import { ComingSoon } from "./pages/ComingSoon";
import { Settings } from "./pages/Settings";

function PageSwitch({ route }: { route: Route }) {
  switch (route) {
    case "home":
      return <Home />;
    case "fps-plus":
      return <FpsPlus />;
    case "pro-config":
      return <ProConfig />;
    case "news":
      return <ComingSoon title="News" source="CS2 news feed" />;
    case "matches":
      return <ComingSoon title="Matches" source="esports match data" />;
    case "ranking":
      return <ComingSoon title="Ranking" source="team ranking data" />;
    case "teams":
      return <ComingSoon title="Teams" source="team roster data" />;
    case "settings":
      return <Settings />;
    default:
      return <Home />;
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>("home");

  return (
    <div className="h-screen flex flex-col">
      <TitleBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar route={route} onNavigate={setRoute} />
        <main className="flex-1 overflow-y-auto">
          <PageSwitch route={route} />
        </main>
      </div>
    </div>
  );
}
