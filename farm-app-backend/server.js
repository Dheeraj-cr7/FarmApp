const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const app = express();
require("dotenv").config();

const port = 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.listen(port, () => {
  console.log("Server started at ", port);
});
