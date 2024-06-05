"use client";


import type { AppProps } from 'next/app';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { useState } from 'react';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';
import Query1 from './query1';
import Query2 from './query2';
import Query3 from './query3';
import Query4 from './query4';
import Query5 from './query5';
import TagSubscription from './tagsubscription';
import { DefaultStorageManagerExample } from './image_upload';
import ShowImage from './showimage';

// Configure Amplify with the settings from the outputs file
Amplify.configure(outputs);

function App({ Component, pageProps }: AppProps) {
  // State variables to control the visibility of different components
  const [showQuery1, setShowQuery1] = useState(false);
  const [showQuery2, setShowQuery2] = useState(false);
  const [showQuery3, setShowQuery3] = useState(false);
  const [showQuery4, setShowQuery4] = useState(false);
  const [showQuery5, setShowQuery5] = useState(false);
  const [showtagSubscription, setShowTagSubscription] = useState(false);
  const [showFullSizeImage, setShowFullSizeImage] = useState(false);

  // Handlers to toggle the visibility of the components
  const handleShowQuery1 = () => {
    setShowQuery1(!showQuery1);
  };

  const handleShowQuery2 = () => {
    setShowQuery2(!showQuery2);
  };

  const handleShowQuery3 = () => {
    setShowQuery3(!showQuery3);
  };
  const handleShowQuery4 = () => {
    setShowQuery4(!showQuery4);
  };
  const handleShowQuery5 = () => {
    setShowQuery5(!showQuery5);
  };
   const handleShowTagSubscription = () => {
    setShowTagSubscription(!showtagSubscription);
  };
  const handleShowFullSizeImage = () => {
    setShowFullSizeImage(!showFullSizeImage);
  };

  return (
    <Authenticator signUpAttributes={[
      'email',
      'phone_number',
    ]}
        
    >
      {({ signOut, user }) => (
        <main className="main-container">
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <br></br>
          <DefaultStorageManagerExample></DefaultStorageManagerExample>
          <br></br>
          <button onClick={handleShowQuery1}>Query 1: Get image based on tags</button>
          <br></br>
          {showQuery1 && <Query1 />}
          <br></br>
          <button onClick={handleShowQuery2}>Query 2: Get image url based on thumbnail url</button>
          <br></br>
          {showQuery2 && <Query2 />}
          <br></br>
          <button onClick={handleShowQuery3}>Query 3: Get images based on tags of an image</button>
          <br></br>
          {showQuery3 && <Query3/>}
          <br></br>
          <button onClick={handleShowQuery4}>Query 4: Add or Delete tags</button>
          <br></br>
          {showQuery4 && <Query4 />}
          <br></br>
          <button onClick={handleShowQuery5}>Query 5: Delete image</button>
          <br></br>
          {showQuery5 && <Query5 />}
          <br></br>
          <button onClick={handleShowTagSubscription}>Tag Subscription</button>
          <br></br>
          {showtagSubscription && <TagSubscription />}
          <br></br>
          <button onClick={handleShowFullSizeImage}>See Full Image based on thumbnail</button>
          <br></br>
          {showFullSizeImage && <ShowImage></ShowImage>}
        </main>
      )}
    </Authenticator>
  );
};


export default App;
