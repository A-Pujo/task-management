"use client";
import { DUMMY_USER } from "../lib/constants";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
      window.localStorage.setItem("loggedIn", "true");
      window.location.href = "/dashboard";
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white border border-gray-200 shadow-lg rounded-xl w-full max-w-md p-10 flex flex-col gap-6"
      >
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2 text-center tracking-tight">
          PDPSIPA Login
        </h1>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            autoComplete="username"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <div className="text-yellow-600 bg-yellow-100 border border-yellow-300 rounded p-2 text-center">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-yellow-400 text-white font-bold text-lg shadow hover:from-blue-600 hover:to-yellow-500 transition"
        >
          Login
        </button>
        <div className="text-xs text-gray-400 text-center mt-2">
          Use <span className="font-bold text-blue-700">pdpsipa</span> /{" "}
          <span className="font-bold text-yellow-600">banteng1001#</span>
        </div>
      </form>
    </div>
  );
}
