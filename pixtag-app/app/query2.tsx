import { query2Call } from "@/src/handleapicalls";
import { useState } from "react";

const Query2 = () => {
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleQuery2 = async () => {
    try {
      const data = await query2Call(thumbnailUrl);
      setResponseMessage(data[0]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setResponseMessage("Error fetching data");
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter thumbnail URL"
        value={thumbnailUrl}
        onChange={(e) => setThumbnailUrl(e.target.value)}
      />
      <br />
      <button onClick={handleQuery2}>Find image</button>
      <br></br>
      {responseMessage && <a href={responseMessage}>{responseMessage}</a>}
    </div>
  );
};

export default Query2;
