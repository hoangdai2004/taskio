const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const instance = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json"
  }
});

async function test() {
  const formData = new FormData();
  fs.writeFileSync("test.txt", "hello");
  formData.append("file", fs.createReadStream("test.txt"));

  try {
    const res = await instance.post("/uploads", formData, {
      transformRequest: [
        (data, headers) => {
          delete headers["Content-Type"];
          delete headers["content-type"]; // Axios might lowercase it
          return data;
        }
      ]
    });
    console.log(res.data);
  } catch(e) {
    console.error(e.response ? e.response.status : e.message);
  }
}
test();
