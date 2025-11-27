import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";
import { useEffect } from "react";
import { FaGoogle } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

export function AuthPage() {
  const { login, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleSuccess(tokenResponse),
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (tokenResponse: TokenResponse) => {
    if (tokenResponse.error) {
      showToast(
        "Google sign-in failed. No credential received.",
        3000,
        "error"
      );
      return;
    }

    try {
      const profile = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      ).then((res) => res.json());

      login({
        id: profile.sub,
        email: profile.email,
        name: profile.name,
      });

      showToast("Google sign-in successful.", 3000, "success");
    } catch (error) {
      showToast("Google sign-in failed. Invalid credential.", 3000, "error");
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <h2>Log in with</h2>
        <form className="auth-form">
          <input className="auth-field" type="email" placeholder="Email" />
          <button className="auth-submit" type="button">
            Continue
          </button>
        </form>
        <div className="auth-divider">
          <span />
          <p>or</p>
          <span />
        </div>
        <div className="auth-google">
          <button
            className="auth-google-button"
            type="button"
            onClick={() => googleLogin()}
          >
            <FaGoogle />
            <span>Sign in with Google</span>
          </button>
        </div>
      </section>
    </main>
  );
}
