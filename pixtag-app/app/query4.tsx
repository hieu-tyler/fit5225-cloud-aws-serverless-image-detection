import { query4Call } from "@/src/handleapicalls";
import { useState } from "react";

const Query4 = () => {
  const [thumbnailUrls, setThumbnailUrls] = useState("");
  //const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleQuery4 = async (type: string) => {
    try {
      const data = await query4Call(thumbnailUrls, type, tags);
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
      <input
        type="text"
        placeholder="Enter tags separated by commas"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <br />
      <button onClick={() => handleQuery4("1")}>Add Tags</button>
      <button onClick={() => handleQuery4("2")}>Delete Tags</button>
      <br></br>
      {responseMessage && <a href={responseMessage}>{responseMessage}</a>}
    </div>
  );
};

export default Query4;
