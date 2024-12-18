import { StorageManager } from "@aws-amplify/ui-react-storage";
import "@aws-amplify/ui-react/styles.css";

export const DefaultStorageManagerExample = () => {
  return (
    <StorageManager
      acceptedFileTypes={["image/*"]}
      path=""
      maxFileCount={1}
      isResumable
    />
  );
};
