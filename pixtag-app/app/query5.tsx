import { query5Call } from "@/src/handleapicalls";
import { useState } from "react";

// Define the Query5 component
const Query5 = () => {
  const [thumbnailUrls, setThumbnailUrls] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Function to handle the query when the button is clicked
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
