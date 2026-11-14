const db = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await db("profiles")
      .select("full_name", "email", "position", "avatar_url")
      .where({ user_id: userId })
      .first();

    if (!profile) {
      return res.json({ full_name: "", email: "", position: "", avatar_url: "" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email, position, avatar_url } = req.body;

    await db("profiles")
      .insert({
        user_id: userId,
        full_name: full_name || "",
        email: email || "",
        position: position || "",
        avatar_url: avatar_url || "",
      })
      .onConflict("user_id")
      .merge(["full_name", "email", "position", "avatar_url"]);

    res.json({ message: "profile saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

