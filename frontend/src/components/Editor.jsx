import { useEffect, useRef, useState, useMemo } from "react";
import * as Y from "yjs";
import Quill from "quill";
import { QuillBinding } from "y-quill";
import "quill/dist/quill.snow.css";
import { WebsocketProvider } from "y-websocket";
import QuillCursors from "quill-cursors";
import DoUsername from "do_username";
import randomColor from "randomcolor";
import { IndexeddbPersistence } from "y-indexeddb";
import QuillBetterTable from "quill-better-table";
import ImageResize from "quill-image-resize-module-react";
import useDocStore from "../store/docStore";
import docService from "../services/docService"

// Register Quill modules, Register the Quill cursors module (for showing multiple users' cursors)
Quill.register("modules/cursors", QuillCursors);
Quill.register(
  {
    "modules/better-table": QuillBetterTable,
    "modules/imageResize": ImageResize,
  },
  true
);

// debounce function is an higher order function
// returns a debounced version of any function you pass to it
// function passed to it will only called after a certail dealy has passed without calling it again
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    // clear previous timer if any
    clearTimeout(timer),
      timer = setTimeout(() => fn(...args), delay)
  };
}

export default function Editor({ token, permission }) {

  // Grab docId from Zustand store
  const { currentDocId } = useDocStore();
  const docId = currentDocId

  // Reference to the editor DOM element and Ensure editor is only initialized once
  const editorRef = useRef(null);
  const initializeRef = useRef(false);

  // Keep track of WebSocket provider and user's color
  const providerRef = useRef(null);
  const colorRef = useRef(null);

  // Username and active users
  const [username, setUsername] = useState(() => DoUsername.generate(8));
  const [activeUsers, setActiveUsers] = useState([]);

  // Toolbar configuration: no toolbar for view-only
  const toolbarOptions = useMemo(() => {
    if (permission === "view") return [];
    return [
      [{ font: [] }, { size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ direction: "rtl" }, { align: [] }],
      ["link", "image", "video"],
      ["clean"],
      // table button (from quill-better-table)
      ["table"],
    ];
  }, [permission]);

  // Initialize the Yjs editor + bindings
  useEffect(() => {
    // Prevent double-initialization
    if (!editorRef.current || initializeRef.current) return;
    initializeRef.current = true;

    // Initialize Yjs doc and persistence
    const ydoc = new Y.Doc();
    const persistence = new IndexeddbPersistence(`quill-doc-${docId}`, ydoc);
    persistence.on("synced", () => {
      console.log("Loaded data from IndexedDB!");
    });

    // room name
    const roomName = `doc-${docId}`;

    // Connect to websocket (replace with your URL)
    const provider = new WebsocketProvider(
      "wss://demos.yjs.dev/ws",
      roomName,
      ydoc
    );
    providerRef.current = provider;

    // For view-only, disable sync
    if (permission !== "edit") provider.disconnect();

    // Awareness protocol
    const awareness = provider.awareness;
    const color = randomColor();
    colorRef.current = color;

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
        cursors: permission === "edit",
        history: { userOnly: true },
        "better-table": {
          operationMenu: {
            items: {
              unmergeCells: {},
              insertRowAbove: {},
              insertRowBelow: {},
              insertColumnLeft: {},
              insertColumnRight: {},
            },
            color: {
              colors: ["#fff", "#f0f0f0"],
              text: "Background Color",
            },
          },
        },
      },
      readOnly: permission !== "edit",
      placeholder: "Start writing...",
      table: false,
      imageResize: {},
    });

    quill.enable(permission === "edit");

    // Bind Yjs and Quill
    const ytext = ydoc.getText("quill");
    

    // load from server if IndexedDB has nothing in it
    persistence.whenSynced.then(async () => {
      console.log("Loaded from IndexedDB");
      const current = ydoc.getText("quill").toString();
      if (current.length === 0) {
        try {
          const fetchedDoc = await docService.getDocById(docId);
          ytext.insert(0, fetchedDoc.doc.content);
        } catch (err) {
        console.error("Failed to fetch doc content:", err)
        }
      }
    });

    // auto-save to DB on changes
    const saveContent = debounce(() => {
      const textContent = ytext.toString();
      docService.updateDoc(docId, token, textContent)
      console.log("updated doc")
    }, 1000)

    ydoc.on("update", saveContent)

    new QuillBinding(ytext, quill, awareness);

    if (permission === "edit") {
      awareness.setLocalStateField("user", {
        name: username,
        color,
      });
    } else {
      awareness.setLocalStateField("user", null); // Removes the user field (no presence)
    }


    // Update the list of users when awareness changes (e.g. someone joins/leaves)
    const updateUserList = () => {
      // Extract user info from all awareness states
      const users = [];
      awareness.getStates().forEach((state, clientId) => {
        if (state.user) {
          users.push({
            id: clientId,
            name: state.user.name,
            color: state.user.color,
            isTyping: !!state.cursor,
          });
        }
      });
      setActiveUsers(users);
    };
    updateUserList();

    // Listen for awareness state changes
    awareness.on("change", updateUserList);

    // When the window is about to unload, clear your own awareness state
    const clearLocal = () => {
      awareness.setLocalStateField("user", null);
    };
    window.addEventListener("beforeunload", clearLocal);

    // Blur selection if the window loses focus
    const blurHandler = () => quill.blur();
    window.addEventListener("blur", blurHandler);


    // // Log document updates from the local user
    // ytext.observe((event) => {
    //   console.log("doc changed locally", event);
    // });

    // // Log WebSocket connection status
    // provider.on("status", (event) => {
    //   console.log("connection status:", event.status);
    // });

    // // Log when synced with other peers
    // provider.on("sync", (isSynced) => {
    //   console.log("synced with peers:", isSynced);
    // });

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", clearLocal);
      window.removeEventListener("blur", blurHandler);
      provider.disconnect();
      ydoc.off("update", saveContent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, permission]);

  // Update presence when username changes
  useEffect(() => {
    const awareness = providerRef.current?.awareness;
    if (permission === "edit" && awareness) {
      awareness.setLocalStateField("user", { name: username, color: colorRef.current });
    }
  }, [username, permission]);

  return (
    <div className=" flex flex-col h-screen">
      {/* Header */}
      <header className="px-6 py-3 bg-white shadow border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">
          🧠 CollabDocs Editor
        </h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your username"
        />
      </header>

      {/* Active Users */}
      <aside className="bg-gray-50 px-6 py-2 text-sm text-gray-600 border-b border-gray-200">
        Active users:
        <ul className="flex gap-4 mt-1 flex-wrap">
          {activeUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-1"
              style={{ color: user.color }}
            >
              ● {user.name} {user.isTyping ? "✍️" : ""}
            </li>
          ))}
        </ul>
      </aside>

      {/* Editor Container */}
      <main className="flex-1 overflow-auto bg-white ">
        <div
          ref={editorRef}
          className="max-w-6xl mx-auto mt-6 p-6 bg-white rounded shadow-sm border border-gray-200"
        />
      </main>
    </div>
  );
}
