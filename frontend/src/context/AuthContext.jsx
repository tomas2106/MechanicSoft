import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const leerJSONSeguro = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "undefined" || raw === "null") return fallback;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ms_token") || null);
  const [user, setUser] = useState(() => leerJSONSeguro("ms_user", null));

  const [taller, setTaller] = useState(() =>
    leerJSONSeguro("ms_taller", {
      id: 1,
      nombre: "Mi Taller",
      slug: "mi-taller",
      logoUrl: "",
      ubicacion: "",
      whatsapp: "",
    })
  );

  const iniciarSesion = (userData, newToken, tallerData) => {
    localStorage.removeItem("ms_token");
    localStorage.removeItem("ms_user");
    localStorage.removeItem("ms_taller");
    localStorage.removeItem("ms_taller_id");

    if (newToken) {
      localStorage.setItem("ms_token", String(newToken));
      setToken(String(newToken));
    }

    if (userData && typeof userData === "object") {
      localStorage.setItem("ms_user", JSON.stringify(userData));
      setUser(userData);
    }

    if (tallerData && typeof tallerData === "object") {
      localStorage.setItem("ms_taller", JSON.stringify(tallerData));
      if (tallerData.id != null) {
        localStorage.setItem("ms_taller_id", String(tallerData.id));
      }
      setTaller(tallerData);
    } else {
      setTaller(null);
    }
  };

  const actualizarTaller = (nuevosDatos) => {
    const actualizado = { ...(taller || {}), ...nuevosDatos };
    localStorage.setItem("ms_taller", JSON.stringify(actualizado));
    setTaller(actualizado);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("ms_token");
    localStorage.removeItem("ms_user");
    localStorage.removeItem("ms_taller");
    localStorage.removeItem("ms_taller_id");
    setToken(null);
    setUser(null);
    setTaller(null);
  };

  const estaAutenticado = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        taller,
        estaAutenticado,
        iniciarSesion,
        actualizarTaller,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);