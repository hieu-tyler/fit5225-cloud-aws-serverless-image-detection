"use client";


import type { AppProps } from 'next/app';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { useState } from 'react';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';

import Query2 from './query2';
import Query1 from './query1';
import Query4 from './query4';
import Query5 from './query5';
import TagSubscription from './tagsubscription';



Amplify.configure(outputs);



function App({ Component, pageProps }: AppProps) {

const [showQuery1, setShowQuery1] = useState(false);
const [showQuery2, setShowQuery2] = useState(false);
const [showQuery4, setShowQuery4] = useState(false);
const [showQuery5, setShowQuery5] = useState(false);
const [showtagSubscription, setShowTagSubscription] = useState(false);

const handleShowQuery1 = () => {
    setShowQuery1(!showQuery1);
  };

  const handleShowQuery2 = () => {
    setShowQuery2(!showQuery2);
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
          <button onClick={handleShowQuery2}>Query 2</button>
          <br></br>
          {showQuery2 && <Query2 />}
          <br></br>
          <button onClick={handleShowQuery1}>Query 1</button>
          <br></br>
          {showQuery1 && <Query1 />}
          <br></br>
          <button onClick={handleShowQuery4}>Query 4</button>
          <br></br>
          {showQuery4 && <Query4 />}
          <br></br>
          <button onClick={handleShowQuery5}>Query 5</button>
          <br></br>
          {showQuery5 && <Query5 />}
          <br></br>
          <button onClick={handleShowTagSubscription}>Tag Subscription</button>
          <br></br>
          {showtagSubscription && <TagSubscription />}
        </main>
      )}
    </Authenticator>
  );
};


export default App;
