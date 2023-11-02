import React, { useEffect, useState } from 'react'
import './App.css'


export default function App() {
    useEffect(() => {
        const script = document.createElement('script');
      
        script.type= "module";
        script.src = "./src/scripts/main.ts";
        script.async = true;
      
        document.body.appendChild(script);
      
        return () => {
          document.body.removeChild(script);
        }
    }, []);



    return <></>
}