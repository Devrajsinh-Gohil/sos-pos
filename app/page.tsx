"use client";

import SocialMediaGenerator from "./components/SocialMediaGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-center">Social Media AI</h1>
        </div>
      </header>
      
      <main className="flex-grow py-6 bg-gray-50 dark:bg-gray-900">
        <SocialMediaGenerator />
      </main>
      
      <footer className="border-t py-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Xaneur. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
