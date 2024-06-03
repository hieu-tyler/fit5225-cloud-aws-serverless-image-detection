"use client";


import type { AppProps } from 'next/app';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { useState } from 'react';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Home from './home';
import { findImageThumbnailUrl } from '@/src/authDetails';


Amplify.configure(outputs);



function App({ Component, pageProps }: AppProps) {

const [showHome, setShowHome] = useState(false);

  const handleShowHome = () => {
    setShowHome(!showHome);
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
          <button onClick={handleShowHome}>Query 2</button>
          <br />
          {showHome && <Home />}
        </main>
      )}
    </Authenticator>
  );
};


export default App;
