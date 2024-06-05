import { fetchAuthSession } from "aws-amplify/auth";

// Function to call Query 1 API
export const query1Call = async (tags: String, counts: String) => {
  const session = await fetchAuthSession();
  const tag_values = tags.split(",");
  const count_values = counts.split(",");

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

  const combinedList = zipArrays(tag_values, count_values);

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
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

// Function to call Query 2 API
export const query2Call = async (thumbnail_url: string) => {
  const session = await fetchAuthSession();

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

// Function to call Query 3 API
export const query3Call = async (imageBase64: String) => {
  const session = await fetchAuthSession();
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

// Function to call Query 4 API
export const query4Call = async (
  thumbnail_urls: string,
  type: string,
  tags: string
) => {
  const session = await fetchAuthSession();
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
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

// Function to call Query 5 API
export const query5Call = async (thumbnail_urls: string) => {
  const session = await fetchAuthSession();
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
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};

// Function to call tag subscription API
export const tagSubscription = async (email: string, tags: string) => {
  const session = await fetchAuthSession();
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
    const data = await response.json();
    return data;
  } else {
    throw new Error(response.statusText);
  }
};
