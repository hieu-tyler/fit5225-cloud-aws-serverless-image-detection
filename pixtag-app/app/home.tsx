import { findImageThumbnailUrl } from "@/src/authDetails";
import { useState } from "react";

const Home = () => {
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleFindImageThumbnailUrl = async () => {
    try {
      const data = await findImageThumbnailUrl(thumbnailUrl);
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
      <button onClick={handleFindImageThumbnailUrl}>Find image</button>
      <br></br>
      {responseMessage && <a href={responseMessage}>{responseMessage}</a>}
    </div>
  );
};

export default Home;
