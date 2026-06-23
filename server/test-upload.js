import fs from "fs";
import FormData from "form-data";
import axios from "axios";

async function test() {
  const formData = new FormData();
  fs.writeFileSync("test.txt", "hello world");
  formData.append("file", fs.createReadStream("test.txt"));

  try {
    const res = await axios.post("http://localhost:5001/api/uploads", formData, {
      headers: {
        ...formData.getHeaders(),
        // simulate the client overriding the boundary
        // "Content-Type": "multipart/form-data"
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
