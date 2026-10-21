function RegisterForm({
  email,
  error,
  name,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
  password,
  role,
  submitting,
  usernameInputRef,
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label>
        Username
        <input
          autoComplete="name"
          maxLength="120"
          onChange={onNameChange}
          ref={usernameInputRef}
          required
          value={name}
        />
      </label>
      <label>
        Email
        <input
          autoComplete="email"
          maxLength="254"
          onChange={onEmailChange}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        Password
        <input
          autoComplete="new-password"
          minLength="8"
          maxLength="72"
          onChange={onPasswordChange}
          required
          type="password"
          value={password}
        />
      </label>
      <label>
        Role
        <select onChange={onRoleChange} required value={role}>
          <option value="customer">Customer</option>
          <option disabled value="admin">Admin (assigned separately)</option>
          <option disabled value="owner">Owner (assigned separately)</option>
        </select>
      </label>
      <p className="auth-hint">
        Passwords must be at least 8 characters. Admin and owner access is assigned separately.
      </p>
      {error ? <p className="feedback error" role="alert">{error}</p> : null}
      <button className="submit-button" disabled={submitting} type="submit">
        {submitting ? "Please wait…" : "Create account"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

export default RegisterForm;
