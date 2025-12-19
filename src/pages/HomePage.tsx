import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import Database from '@tauri-apps/plugin-sql';

function HomePage() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  onMount(async () => {
    console.log("hi");
    const db = await Database.load('sqlite:standclock.db');
    console.log(db);
  });

  async function greet() {
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  return (
    <main class="container">
      <h1 class="font-bold">Welcome to Tauri + Solid</h1>

      <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

      <form
        class="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          class="input"
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button class="btn btn-primary" type="submit">Greet</button>
      </form>
      <p>{greetMsg()}</p>
    </main>
  );
}

export default HomePage;
