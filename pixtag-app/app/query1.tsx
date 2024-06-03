import { query1Call } from "@/src/handleapicalls";
import { useState } from "react";

const Query1 = () => {
  const [tags, setTags] = useState("");
  const [counts, setCounts] = useState("");
  //const [responseMessage, setResponseMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState<string[]>([]);

  const handleQuery1 = async () => {
    try {
      const data = await query1Call(tags, counts);
      console.log(data);
      //setResponseMessage(data[0]);
      setResponseMessage(data.map((item: String) => item));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setResponseMessage(["Error in fetching data"]);
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter tags separated by commas"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Enter counts separated by commas"
        value={counts}
        onChange={(e) => setCounts(e.target.value)}
      />
      <br />
      <button onClick={handleQuery1}>Find image</button>
      <br></br>
      {responseMessage && (
        <ul>
          {responseMessage.map((link, index) => (
            <li key={index}>
              <a href={link}>{link}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Query1;
