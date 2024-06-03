import { fetchAuthSession } from "aws-amplify/auth";

// export const getCredentials = async () => {
//   const session = await fetchAuthSession();
//   if (session.tokens) {
//     console.log("id token", session.tokens.idToken);
//     console.log("access token", session.tokens.accessToken);
//   }

//   const response = await fetch(
//     "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag",
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${session.tokens?.idToken}`,
//       },
//     }
//   );

//   if (response.ok) {
//     const data = await response.json();
//     console.log("Response data:", data);
//   } else {
//     console.error("Failed to fetch data:", response.statusText);
//   }
// };

export const findImageThumbnailUrl = async (thumbnail_url: string) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }
  const thumbnailUrl =
    "https://pixtagthumbnailbucket.s3.ap-southeast-2.amazonaws.com/000000561333_thumbnail.jpg";
  //   const response = await fetch(
  //     "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag?thumbnail_url={thumbnail_url}}",
  //     {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${session.tokens?.idToken}`,
  //       },
  //     }
  //   );
  const url = new URL(
    "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag"
  );
  url.searchParams.append("thumbnail_url", thumbnail_url);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens?.idToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};
