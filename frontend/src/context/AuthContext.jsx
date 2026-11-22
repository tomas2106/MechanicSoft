import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ms_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [taller, setTaller] = useState(() => {
    const saved = localStorage.getItem("ms_taller");
    return saved ? JSON.parse(saved) : {
      id: 1,
      nombre: "Mi Taller",
      slug: "mi-taller",
      logoUrl: "",
      ubicacion: "",
      whatsapp: ""
    };
  });

  const iniciarSesion = (userData, token, tallerData) => {
    localStorage.setItem("ms_token", token);
    localStorage.setItem("ms_user", JSON.stringify(userData));
    if (tallerData) {
      localStorage.setItem("ms_taller", JSON.stringify(tallerData));
      localStorage.setItem("ms_taller_id", tallerData.id);
      setTaller(tallerData);
    }
    setUser(userData);
  };

  const actualizarTaller = (nuevosDatos) => {
    const actualizado = { ...taller, ...nuevosDatos };
    localStorage.setItem("ms_taller", JSON.stringify(actualizado));
    setTaller(actualizado);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("ms_token");
    localStorage.removeItem("ms_user");
    localStorage.removeItem("ms_taller");
    localStorage.removeItem("ms_taller_id");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, taller, iniciarSesion, actualizarTaller, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);