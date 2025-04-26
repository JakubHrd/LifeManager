import React, { useEffect, useState } from "react";

interface UserSetting {
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  gender: string | null;
  target_weight_kg: number | null;
  main_goal: string | null;
}

const UserSettingForm = () => {
  const [userSetting, setUserSetting] = useState<UserSetting>({
    height_cm: null,
    weight_kg: null,
    birth_date: null,
    gender: null,
    target_weight_kg: null,
    main_goal: null,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token"); // pokud ukládáš JWT token

  useEffect(() => {
    console.log('token' ,{token});
    const fetchUserSetting = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/userSetting", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUserSetting(data);
      } catch (error) {
        console.error("Chyba při načítání nastavení", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSetting();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserSetting((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        console.log('userSetting',{userSetting});
      const res = await fetch("http://localhost:5000/api/userSetting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userSetting),
      });

      if (res.ok) {
        setMessage("Nastavení bylo úspěšně uloženo.");
      } else {
        const err = await res.json();
        setMessage(err.message || "Chyba při ukládání.");
      }
    } catch (error) {
      console.error("Chyba při odesílání dat", error);
      setMessage("Chyba serveru.");
    }
  };

  if (loading) return <p>Načítání...</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>Moje nastavení</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Výška (cm):</label>
          <input
            type="number"
            name="height_cm"
            value={userSetting.height_cm ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Váha (kg):</label>
          <input
            type="number"
            name="weight_kg"
            value={userSetting.weight_kg ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Datum narození:</label>
          <input
            type="date"
            name="birth_date"
            value={userSetting.birth_date ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Pohlaví:</label>
          <select name="gender" value={userSetting.gender ?? ""} onChange={handleChange}>
            <option value="">-- vyber --</option>
            <option value="male">Muž</option>
            <option value="female">Žena</option>
            <option value="other">Jiné</option>
          </select>
        </div>
        <div>
          <label>Cílová váha (kg):</label>
          <input
            type="number"
            name="target_weight_kg"
            value={userSetting.target_weight_kg ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Hlavní cíl:</label>
          <select name="main_goal" value={userSetting.main_goal ?? ""} onChange={handleChange}>
            <option value="">-- vyber --</option>
            <option value="lose_weight">Zhubnout</option>
            <option value="maintain_weight">Udržet váhu</option>
            <option value="gain_muscle">Nabrat svaly</option>
            <option value="improve_health">Zlepšit zdraví</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: "20px" }}>Uložit nastavení</button>
      </form>
    </div>
  );
};

export default UserSettingForm;
