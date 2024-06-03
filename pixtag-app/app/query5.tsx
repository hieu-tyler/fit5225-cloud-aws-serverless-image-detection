import { query5Call } from "@/src/handleapicalls";
import { useState } from "react";

const Query5 = () => {
  const [thumbnailUrls, setThumbnailUrls] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleQuery5 = async () => {
    try {
      const data = await query5Call(thumbnailUrls);
      console.log(data);
      setResponseMessage(data.message);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setResponseMessage("Error in fetching data");
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter urls separated by commas"
        value={thumbnailUrls}
        onChange={(e) => setThumbnailUrls(e.target.value)}
      />
      <br />
      <button onClick={() => handleQuery5()}>Delete image</button>
      <br></br>
      {responseMessage && <a href={responseMessage}>{responseMessage}</a>}
    </div>
  );
};

export default Query5;
