import { useEffect, useRef, useState } from "react";
import { loginUser, registerUser, storeAuthToken } from "../services/api";
import RegisterForm from "./RegisterForm";

function AuthModal({ initialMode = "login", onAuthenticated, onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, onClose, submitting]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response =
        mode === "signup"
          ? await registerUser({ name, email, password, role })
          : await loginUser({ email, password });
      storeAuthToken(response.token);
      onAuthenticated(response.user);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="payment-backdrop auth-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="auth-title"
        aria-modal="true"
        className="payment-modal auth-modal"
        role="dialog"
      >
        <button
          aria-label="Close account dialog"
          className="payment-close"
          disabled={submitting}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <p className="eyebrow">YOUR MOVIE NIGHT AWAITS</p>
        <h2 id="auth-title">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-copy">
          {mode === "signup"
            ? "Create an account to continue booking your tickets."
            : "Log in to continue with your selected movie."}
        </p>
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
            role="tab"
            type="button"
          >
            Log in
          </button>
          <button
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => changeMode("signup")}
            role="tab"
            type="button"
          >
            Sign up
          </button>
        </div>
        {mode === "signup" ? (
          <RegisterForm
            email={email}
            error={error}
            name={name}
            onEmailChange={(event) => setEmail(event.target.value)}
            onNameChange={(event) => setName(event.target.value)}
            onPasswordChange={(event) => setPassword(event.target.value)}
            onRoleChange={(event) => setRole(event.target.value)}
            onSubmit={submit}
            password={password}
            role={role}
            submitting={submitting}
            usernameInputRef={firstInputRef}
          />
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>
              Email address
              <input
                autoComplete="email"
                maxLength="254"
                onChange={(event) => setEmail(event.target.value)}
                ref={firstInputRef}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                minLength="8"
                maxLength="72"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {error ? <p className="feedback error" role="alert">{error}</p> : null}
            <button className="submit-button" disabled={submitting} type="submit">
              {submitting ? "Please wait…" : "Log in"}
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default AuthModal;
