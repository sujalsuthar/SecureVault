import { useState } from "react";
import { usePwnedPasswordCheck } from "../hooks/usePwnedPasswordCheck";
import PasswordBreachWarning from "./PasswordBreachWarning";

const initialForm = {
  title: "",
  username: "",
  password: "",
  notes: "",
};

const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()-_=+[]{};:,.?/|";
const allChars = `${uppercaseChars}${lowercaseChars}${numberChars}${symbolChars}`;

const getRandomInt = (max) => {
  if (window.crypto && window.crypto.getRandomValues) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
  }

  return Math.floor(Math.random() * max);
};

const getRandomChar = (characters) => {
  return characters[getRandomInt(characters.length)];
};

const shuffleString = (value) => {
  const chars = value.split("");

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const randomIndex = getRandomInt(index + 1);
    [chars[index], chars[randomIndex]] = [chars[randomIndex], chars[index]];
  }

  return chars.join("");
};

const generateSecurePassword = () => {
  const passwordLength = 12 + getRandomInt(5);
  const baseChars = [
    getRandomChar(uppercaseChars),
    getRandomChar(lowercaseChars),
    getRandomChar(numberChars),
    getRandomChar(symbolChars),
  ];

  while (baseChars.length < passwordLength) {
    baseChars.push(getRandomChar(allChars));
  }

  return shuffleString(baseChars.join(""));
};

function AddVaultForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const breachCheck = usePwnedPasswordCheck(form.password, true);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const created = await onSubmit({ ...form, file: selectedFile });
    if (created) {
      setForm(initialForm);
      setShowPassword(false);
      setSelectedFile(null);
    }
  };

  const handleGeneratePassword = () => {
    const generatedPassword = generateSecurePassword();
    setForm((previous) => ({ ...previous, password: generatedPassword }));
    setShowPassword(true);
  };

  return (
    <form className="panel-subtle grid gap-3 sm:gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h3 className="heading-md">Add Vault Item</h3>
        <span className="status-pill w-fit shrink-0">Encrypted Write</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">Title</span>
          <input className="input-cyber" name="title" placeholder="Ex: GitHub" value={form.title} onChange={handleChange} required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">Username / Email</span>
          <input
            className="input-cyber"
            name="username"
            placeholder="Ex: john.doe@mail.com"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">Password</span>
        <input
          className="input-cyber"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Credential password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <PasswordBreachWarning
          loading={breachCheck.loading}
          pwned={breachCheck.pwned}
          count={breachCheck.count}
          error={breachCheck.error}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">Notes</span>
        <textarea
          className="textarea-cyber"
          name="notes"
          placeholder="MFA details, recovery steps, or comments"
          value={form.notes}
          onChange={handleChange}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">Attachment (optional)</span>
        <input
          className="input-cyber file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 dark:file:bg-cyber-700 dark:file:text-slate-100"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.gif"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        {selectedFile ? (
          <span className="text-xs text-slate-600 dark:text-slate-300">Selected: {selectedFile.name}</span>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">Upload a document or image linked to this vault item.</span>
        )}
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={handleGeneratePassword}>
          Generate Password
        </button>
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setShowPassword((value) => !value)}>
          {showPassword ? "Hide Password" : "Show Password"}
        </button>
        <button className="btn-primary w-full sm:w-auto sm:min-w-[10rem]" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Securing..." : "Add Vault Item"}
        </button>
      </div>
    </form>
  );
}

export default AddVaultForm;
