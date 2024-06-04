import { tagSubscription } from "@/src/handleapicalls";
import { useState } from "react";

const TagSubscription = () => {
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleTagSubscription = async () => {
    try {
      const data = await tagSubscription(email, tags);
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
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Enter tags separated by commas"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <br />
      <button onClick={() => handleTagSubscription()}>Subscribe</button>
      <br></br>
      {responseMessage && <a href={responseMessage}>{responseMessage}</a>}
    </div>
  );
};

export default TagSubscription;
