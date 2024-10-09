import { useEffect, useState } from "preact/hooks";
import { Router, route } from "preact-router";
import Dashboard from "./components/Dashboard";
import CycleSetup from "./components/CycleSetup/CycleSetup";
import { CycleProvider } from "./components/CycleSetup/CycleContext";
import { databases } from "./lib/appwrite";

const App = () => {
  const clientId = import.meta.env.VITE_CUDIS_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isCycleSetupComplete, setIsCycleSetupComplete] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null); // Track login state
  const [cudisAccessToken, setCudisAccessToken] = useState(null);

  // Google login function
  const handleGoogleLogin = async () => {
    localStorage.setItem("isGoogleLoginRedirect", "true");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile`;
    window.location.href = authUrl;
  };

  // Handle Google OAuth2 callback
  useEffect(() => {
    const fetchUserDetails = async () => {
      const isGoogleLoginRedirect = localStorage.getItem(
        "isGoogleLoginRedirect"
      );
      if (isGoogleLoginRedirect) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const token = hashParams.get("access_token");
        if (token) {
          localStorage.setItem("googleAccessToken", token);
          setGoogleAccessToken(token); // Update state
          localStorage.removeItem("isGoogleLoginRedirect");

          // Fetch Google user details using the access token
          await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .then((user) => {
              localStorage.setItem("googleUser", JSON.stringify(user));
              localStorage.setItem("userId", user.sub);
              const userData = {
                email: user.email,
                name: user.name,
                userId: user.sub,
                accessToken: token,
              };

              // Check if user exists in Appwrite
              databases
                .listDocuments(
                  import.meta.env.VITE_APPWRITE_DATABASE_ID,
                  import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID
                )
                .then((response) => {
                  const existingUser = response.documents.find(
                    (doc) => doc.userId === user.sub
                  );
                  if (!existingUser) {
                    databases
                      .createDocument(
                        import.meta.env.VITE_APPWRITE_DATABASE_ID,
                        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
                        "unique()",
                        userData
                      )
                      .then(() => {
                        console.log("User added to Appwrite");
                      })
                      .catch(console.error);
                  } else {
                    console.log("User already exists in Appwrite");
                  }
                })
                .catch(console.error);
            })
            .catch(console.error);
        }
      } else {
        const token = localStorage.getItem("googleAccessToken");
        if (token) setGoogleAccessToken(token); // Use token if already in localStorage
      }
    };
    fetchUserDetails();
  }, []);

  const handleCudisPairing = () => {
    localStorage.setItem("isCudisPairingRedirect", "true");
    const baseUrl = import.meta.env.VITE_CUDIS_API;
    const authUrl = `${baseUrl}/oauth/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const isCudisPairingRedirect = localStorage.getItem(
      "isCudisPairingRedirect"
    );
    if (isCudisPairingRedirect) {
      const urlParams = new URLSearchParams(
        window.location.search.substring(1)
      );
      const token = urlParams.get("access_token");
      if (token) {
        localStorage.setItem("cudisAccessToken", token); // Store Cudis token in localStorage
        setCudisAccessToken(token); // Update state
        localStorage.removeItem("isCudisPairingRedirect");
      } else {
        const token = localStorage.getItem("cudisAccessToken");
        if (token) setCudisAccessToken(token); // Use token if already in localStorage
      }
    }
  }, []);

  // Handle logout function
  const handleLogout = () => {
    const token = localStorage.getItem("googleAccessToken");
    if (token) {
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
      })
        .then(() => {
          console.log("Google access token revoked");
          localStorage.clear(); // Clear all local storage items
          setGoogleAccessToken(null);
          setCudisAccessToken(null); // Clear state
          window.location.replace("/"); // Redirect to root
        })
        .catch(console.error);
    } else {
      localStorage.clear();
      setGoogleAccessToken(null);
      setCudisAccessToken(null);
      window.location.replace("/"); // Redirect to root
    }
  };

  // Handle cycle setup completion
  const handleSetupComplete = () => {
    setIsCycleSetupComplete(true);
  };

  // Redirect to dashboard after setup completion
  useEffect(() => {
    if (isCycleSetupComplete) {
      route("/dashboard", true);
    }
  }, [isCycleSetupComplete]);

  const googleUser = JSON.parse(localStorage.getItem("googleUser"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-indigo-950 text-zinc-200">
      <CycleProvider>
        <header
          className={`${
            !googleUser || !isCycleSetupComplete
              ? "text-5xl text-center p-8"
              : "text-xl text-center font-medium px-4 pt-2 pb-0"
          }`}
        >
          SereneCycle
        </header>

        {!googleAccessToken && (
          <div className="text-center mx-auto max-w-lg px-6">
            <div className="text-4xl mb-4 font-medium bg-gradient-to-r from-teal-400 to-yellow-200 bg-clip-text text-transparent">
              Welcome
            </div>
            <div className="text-2xl font-medium bg-gradient-to-r from-yellow-200 to-pink-400 bg-clip-text text-transparent">
              Empower Your Cycle, Elevate Your Wellness
            </div>
            <div className="my-4 text-xl">
              Our app is tailored to your unique cycle, giving you personalized
              insights and wellness suggestions based on your symptoms, activity
              levels, and menstrual cycle data.
            </div>
            <div className="mb-4 text-xl">
              SereneCycle seamlessly integrates with the Cudis Ring, combining
              your ring data with personalized recommendations.
            </div>
          </div>
        )}

        <section className="px-4">
          <div className="max-w-md mx-auto">
            {!googleAccessToken ? (
              <div className="p-6 text-center">
                <button
                  className="text-lg font-bold px-4 py-2 rounded-md bg-violet-900 hover:bg-violet-700"
                  onClick={handleGoogleLogin}
                >
                  Login with Google
                </button>
              </div>
            ) : !cudisAccessToken ? (
              <div className="p-6 text-center">
                <button
                  className="text-lg font-bold px-4 py-2 rounded-md bg-violet-900 hover:bg-violet-700"
                  onClick={handleCudisPairing}
                >
                  Pair with your Cudis Ring
                </button>
              </div>
            ) : !isCycleSetupComplete ? (
              <div className="pb-10">
                <CycleSetup onSetupComplete={handleSetupComplete} />
              </div>
            ) : (
              <Router>
                <Dashboard path="/dashboard" />
              </Router>
            )}
            {googleAccessToken && (
              <div className="w-full text-center pb-8">
                <button
                  className="text-lg font-bold px-4 py-2 rounded-md bg-violet-900 hover:bg-violet-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </section>
      </CycleProvider>
    </div>
  );
};

export default App;
