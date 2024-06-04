import { StorageImage } from "@aws-amplify/ui-react-storage";

import { useState } from "react";

const extractImageNumber = (url: string) => {
  const regex = /(\d+)_thumbnail\.jpg$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const ShowImage = () => {
  const [imageLink, setImageLink] = useState("");
  const [imageKey, setImageKey] = useState("");

  const getFullImage = () => {
    let imageKeyValue = extractImageNumber(imageLink);
    imageKeyValue = imageKeyValue + ".jpg";
    setImageKey(imageKeyValue ? imageKeyValue : "");
    console.log(imageKey);
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter link"
        value={imageLink}
        onChange={(e) => setImageLink(e.target.value)}
      />
      <br />
      <button onClick={getFullImage}>Find image</button>
      <br></br>
      {imageKey && <StorageImage alt="Image not available" path={imageKey} />}
    </div>
  );
};

export default ShowImage;
