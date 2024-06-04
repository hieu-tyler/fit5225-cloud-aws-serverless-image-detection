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

export const query2Call = async (thumbnail_url: string) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }

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

export const query1Call = async (tags: String, counts: String) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }
  const tag_values = tags.split(",");
  const count_values = counts.split(",");

  // Function to zip two arrays and handle different lengths

  const zipArrays = (
    arr1: string[],
    arr2: string[]
  ): [string | null, number | null][] => {
    const maxLength = Math.max(arr1.length, arr2.length);
    const result: [string | null, number | null][] = [];
    for (let i = 0; i < maxLength; i++) {
      const element1 = arr1[i] || null;
      const element2 = arr2[i] ? parseInt(arr2[i], 10) : null;
      result.push([element1, element2]);
    }
    return result;
  };

  // Create a list of lists with elements at the same index from both arrays
  const combinedList = zipArrays(tag_values, count_values);
  console.log(combinedList);

  const url = new URL(
    "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag"
  );
  const body = {
    tags: combinedList,
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens?.idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    console.log(response);
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

export const query3Call = async (imageBase64: String) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }

  const url = new URL(
    "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag"
  );
  const body = {
    image_base64: imageBase64.split(",")[1],
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens?.idToken}`,
    },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

export const query4Call = async (
  thumbnail_urls: string,
  type: string,
  tags: string
) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }
  const tag_values = tags.split(",");
  const type_value = parseInt(type);
  const thumbnail_url_values = thumbnail_urls.split(",");

  const url = new URL(
    "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag"
  );
  const body = {
    url: thumbnail_url_values,
    type: type_value,
    tags: tag_values,
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens?.idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    console.log(response);
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

export const query5Call = async (thumbnail_urls: string) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }

  const thumbnail_url_values = thumbnail_urls.split(",");

  const url = new URL(
    "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag"
  );
  const body = {
    thumbnail_urls: thumbnail_url_values,
  };

  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens?.idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    console.log(response);
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

export const tagSubscription = async (email: string, tags: string) => {
  const session = await fetchAuthSession();
  if (session.tokens) {
    console.log("id token", session.tokens.idToken);
    console.log("access token", session.tokens.accessToken);
  }

  const tag_values = tags.split(",");

  const url = new URL(
    "https://wnwp3hn26g.execute-api.ap-southeast-2.amazonaws.com/pixtag-test1/api/pixtag"
  );
  const body = {
    sub_email: email,
    tags: tag_values,
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens?.idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    console.log(response);
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};
