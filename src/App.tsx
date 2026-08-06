import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { AdminPage } from "./pages/AdminPage";
import { DisplayPage } from "./pages/DisplayPage";
import { LoginPage } from "./pages/LoginPage";
import {
  subscribeToTeams,
} from "./lib/teamRespository";
import { auth } from "./lib/firebase";
import type { Team } from "./types/team";

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [error, setError] = useState("");

  const isAdminRoute =
    window.location.pathname === "/admin";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoadingAuth(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    

    const unsubscribe = subscribeToTeams(
      (nextTeams) => {
        setTeams(nextTeams);
        setLoadingTeams(false);
      },
      (caughtError) => {
        console.error(caughtError);
        setError("Unable to load the leaderboard.");
        setLoadingTeams(false);
      },
    );

    return unsubscribe;
  }, []);

  if (loadingTeams || loadingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#02040c] text-white">
        Loading…
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#02040c] text-pink-300">
        {error}
      </main>
    );
  }

  if (!isAdminRoute) {
    return <DisplayPage teams={teams} />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AdminPage
      teams={teams}
      userEmail={user.email ?? "Admin"}
    />
  );
}