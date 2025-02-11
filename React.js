import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function CTRCalculator() {
  const [asinRevenue, setAsinRevenue] = useState(0);
  const [currentCTR, setCurrentCTR] = useState(0);
  const [ctrIncrease, setCtrIncrease] = useState(0);
  const [results, setResults] = useState({});
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const calculate = () => {
    const newCTR = currentCTR + ctrIncrease;
    const ctrIncreasePercent = ((newCTR - currentCTR) / currentCTR) * 100;
    const revenueIncrease = asinRevenue * (newCTR / currentCTR - 1);
    const newEstimatedRevenue = asinRevenue + revenueIncrease;

    setResults({
      newCTR,
      ctrIncreasePercent,
      revenueIncrease,
      newEstimatedRevenue,
    });

    if (user) {
      saveCalculation(user.uid, { asinRevenue, currentCTR, ctrIncrease, results });
    }
  };

  const saveCalculation = async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await setDoc(userRef, {
          ...userData,
          calculations: [...userData.calculations, data],
        });
      } else {
        await setDoc(userRef, {
          email: user.email,
          calculations: [data],
        });
      }
      console.log('Calculation saved!');
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log('User signed up:', userCredential.user);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log('User signed in:', userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>CTR Calculator</h1>
      </header>
      {!user ? (
        <div className="auth-section">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={handleSignIn}>Sign In</button>
        </div>
      ) : (
        <>
          <div className="hero">
            <h2>Calculate the impact of CTR increase on your Amazon PPC revenue</h2>
          </div>
          <div className="input-section">
            <div className="input-group">
              <label>ASIN Monthly Revenue ($): </label>
              <input type="number" value={asinRevenue} onChange={(e) => setAsinRevenue(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Current CTR (%): </label>
              <input type="number" value={currentCTR} onChange={(e) => setCurrentCTR(parseFloat(e.target.value))} />
            </div>
            <div className="input-group">
              <label>CTR Increase (%): </label>
              <input type="number" value={ctrIncrease} onChange={(e) => setCtrIncrease(parseFloat(e.target.value))} />
            </div>
            <button className="calculate-button" onClick={calculate}>Calculate</button>
          </div>
          <div className="results-section">
            <h2>Results</h2>
            <div className="results-card">
              <p>New CTR (%): {results.newCTR}</p>
              <p>% Increase in CTR: {results.ctrIncreasePercent}</p>
              <p>Estimated Revenue Increase ($): {results.revenueIncrease}</p>
              <p>New Estimated Revenue ($): {results.newEstimatedRevenue}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CTRCalculator;
