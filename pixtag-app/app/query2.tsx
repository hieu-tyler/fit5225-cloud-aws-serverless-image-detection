import { query2Call } from "@/src/handleapicalls";
import { useState } from "react";

// Define the Query2 component
const Query2 = () => {
  // Declare state variables
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Function to handle the query when the button is clicked
  const handleQuery2 = async () => {
    try {
      const data = await query2Call(thumbnailUrl);
      if (data.length === 0) {
        setResponseMessage("No image found with the entered thumbnail");
      } else {
        setResponseMessage(data[0]);
      }
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
