const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));
app.use(express.json());

// API routes - you'll need to implement these
app.get('/api/suppliers', (req, res) => {
  // Your database logic here
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Then update Start Command to:**
```
node server.js
