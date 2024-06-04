import { defineStorage } from "@aws-amplify/backend";

export const data = defineStorage({
  name: "pixtagimageupload",
  access: (allow) => ({
    "test-pictures/{entity_id}/*": [
      allow.guest.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
    "picture-submissions/*": [
      allow.authenticated.to(["read", "write"]),
      allow.guest.to(["read", "write"]),
    ],
  }),
});
