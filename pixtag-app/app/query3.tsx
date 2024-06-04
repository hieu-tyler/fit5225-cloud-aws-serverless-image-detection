import { query3Call } from "@/src/handleapicalls";
import { useState } from "react";

const Query3 = () => {
  const [imageBase64, setImageBase64] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuery3 = async () => {
    try {
      const data = await query3Call(imageBase64);
      setResponseMessage(data.map((item: String) => item));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setResponseMessage("Error fetching data");
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {imageBase64 && (
        <div>
          <p>Base64 String:</p>
          <textarea value={imageBase64} readOnly rows={10} cols={50}></textarea>
        </div>
      )}

      <br />
      <button onClick={handleQuery3}>Search Thumbnail</button>
      <br></br>
      {responseMessage && <a href={responseMessage}>{responseMessage}</a>}
    </div>
  );
};

export default Query3;
