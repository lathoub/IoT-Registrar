export var apiKey = function (req, res, next) {
  const apiKey = req.get("API-Key");
  if (!apiKey || apiKey !== 'PeP') {
    res.status(401).json({ error: "unauthorised" });
  } else {
    next();
  }
};

export default apiKey;
