"use client";

import { useState } from "react";
import { subscribe } from "@/app/(blog)/actions";

export const SubscribeForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
      const result = await subscribe(email);
      console.log("result", result.message);
      setMessage(result.message);
      
      if (result.success) {
        setEmail("");
      }
    
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          
        />
        <button type="submit" >
          Subscribe
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};
